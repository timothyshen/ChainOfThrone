import json
import os
import time
import uuid

import requests
from eth_abi import encode
from eth_account import Account
from eth_account.signers.local import LocalAccount
from web3 import Web3
from web3.middleware import (ExtraDataToPOAMiddleware,
                             SignAndSendRawMiddlewareBuilder)

REDPILL_API_KEY = "sk-41lW2OVdB7pAI8lp501Hg9wsogMt64Ou81QR1L2xQeN8mD9M"
LINEA_SEPOLIA_RPC = "https://linea-sepolia-rpc.publicnode.com"
ETH_SEPOLIA_RPC = "https://eth-sepolia-public.unifra.io"
ETH_DEPLOYED_ADDR = "0x5fB79DD30F7Ca9d865a43e97fa1D41119ACe33Aa"

private_key = os.environ.get("PRIVATE_KEY")
abi = open("./abi.json", "r").readline().strip()
w3 = Web3(Web3.HTTPProvider(ETH_SEPOLIA_RPC))
w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)


def _funding(_addr):
    account: LocalAccount = Account.from_key(private_key)
    print(account.address, _addr)
    w3.middleware_onion.inject(
        SignAndSendRawMiddlewareBuilder.build(account), layer=0)
    tx_hash = w3.eth.send_transaction(
        {"from": account.address, "to": _addr, "value": 1 * 10**16}
    )
    print(tx_hash)


class Agent:
    def __init__(self, _contract_addr):
        self.api_key = REDPILL_API_KEY
        self.session = uuid.uuid4()
        self.account = w3.eth.account.create()
        self.template = open("./llm_template.txt", "r").readline()
        self.contract = w3.eth.contract(address=_contract_addr, abi=abi)
        self.contract.functions.addPlayer.call()
        # print(self.w3.to_hex(self.account.key))
        # _funding(self.account.address)

    def consult(self, current_game, addr):
        response = requests.post(
            url="https://api.red-pill.ai/v1/chat/completions",
            headers={
                "Authorization": "Bearer %s" % REDPILL_API_KEY,
            },
            data=json.dumps(
                {
                    "model": "claude-3-5-sonnet-20241022",
                    "messages": [
                        {
                            "role": "user",
                            "content": self.template % (addr, current_game),
                        }
                    ],
                }
            ),
        )
        # print(self.template % (addr, current_game))
        suggested_move = json.loads(response.text)[
            "choices"][0]["message"]["content"]
        print(suggested_move)
        return suggested_move

    def read_game(self):
        current_game = self.contract.functions.getGrid.call()
        decoded_game = [[x[2], x[3]] for x in current_game]
        for i, x in enumerate(decoded_game):
            if x[0] == "0x0000000000000000000000000000000000000000":
                decoded_game[i] = ["NA", x[1]]
        print(decoded_game)
        return decoded_game

    def move(self, suggested_move):
        suggested_move = suggested_move[1:-1].split(",")
        """
        move = {
            "players": w3.to_hex(self.account.key),
            "fromX": int(suggested_move[0]),
            "fromY": int(suggested_move[1]),
            "toX": int(suggested_move[2]),
            "toY": int(suggested_move[3]),
            "units": int(suggested_move[4]),
        }
        """
        move = (
            w3.to_hex(self.account.key),
            encode(int(suggested_move[0]), "uint8"),
            encode(int(suggested_move[1]), "uint8"),
            encode(int(suggested_move[2]), "uint8"),
            encode(int(suggested_move[3]), "uint8"),
            encode(int(suggested_move[4]), "uint256"),
        )
        self.contract.functions.makeMove(move).call()

    def play(self):
        while self.contract.gameStatus.call() != 2:
            current_game = self.read_game()
            suggested_move = self.consult(
                str(current_game), w3.to_hex(self.account.key)
            )
            try:
                self.move(suggested_move)
            time.sleep(5)


if __name__ == "__main__":
    a = AGENT("0xBC9836B16DC8916382f81B9379A53785537604E0")
    current_game = a.read_game()
    suggested_move = a.consult(
        str(current_game), "0xb9E4448cE107a1Fb784ee635100A20bd8BA047b2"
    )
    a.move(suggested_move)

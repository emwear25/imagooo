"""Tiny Printables GraphQL helper (public API; licence + file list + download links)."""
import json, subprocess

API = "https://api.printables.com/graphql/"


def gql(query, variables):
    out = subprocess.run(["curl", "-s", API, "-H", "content-type: application/json", "-H", "User-Agent: Mozilla/5.0",
                          "-d", json.dumps({"query": query, "variables": variables})], capture_output=True, text=True).stdout
    return json.loads(out)["data"]


def info(pid):
    return gql("query($id:ID!){ print(id:$id){ id name license{name} user{publicUsername} stls{ id name fileSize } } }", {"id": pid})["print"]


def link(pid, fid):
    d = gql("mutation($id:ID!,$printId:ID!){ getDownloadLink(id:$id, printId:$printId, fileType:stl, source:model_detail){ ok output{ link } } }",
            {"id": fid, "printId": pid})
    return d["getDownloadLink"]["output"]["link"]

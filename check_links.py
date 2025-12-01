import requests
from bs4 import BeautifulSoup
import os

def find_links(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
    return [a.get("href") for a in soup.find_all("a") if a.get("href")]

def check_link(url):
    try:
        r = requests.head(url, timeout=5)
        return r.status_code < 400
    except:
        return False

def main():
    project_dir = "."
    broken = []

    for root, _, files in os.walk(project_dir):
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                links = find_links(path)

                for link in links:
                    if link.startswith("http"):
                        ok = check_link(link)
                        if not ok:
                            broken.append(link)

    if broken:
        print("Broken links found:")
        for b in broken:
            print(" -", b)
        exit(1)
    else:
        print("No broken links found!")

if __name__ == "__main__":
    main()

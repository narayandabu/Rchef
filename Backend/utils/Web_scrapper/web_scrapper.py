import requests
from bs4 import BeautifulSoup
import json
import sys
def trim_from_website(link):
    try:
        r = requests.get(link)
        soup = BeautifulSoup(r.content, 'html.parser')
        s = soup.find('div', class_='entry-content')
        content = soup.get_text()
        arr = content.split()
        x = ""
        for i in range(0,min(len(arr),100)):
            if arr[i] == ' ' or arr[i] == '\n':
                arr[i] = ''
            x+=(' '+arr[i])
    except Exception as e:
        print(e)
    return x
def main():
    try:
        link = sys.stdin.read()
        input_data = json.loads(link)
        print(type(input_data))
        # output_data = trim_from_website(input_data)
        # output_data = output_data
        # print(output_data)  
    except json.JSONDecodeError as e:
        print("ERROR",e)
    except Exception as e:
        print("ERROR",e)

if __name__ == "__main__":
    main()
# print(trim_from_website('https://en.wikipedia.org/wiki/Artificial_intelligence'))




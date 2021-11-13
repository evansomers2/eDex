import requests
import os

os.chdir("C:/$Info3141/Pokedex/eDex/assets/pokemon");


for i in range(1, 152):
    if i < 10:
        num = "00" + str(i)
    elif i >=10 and i <100:
        num = "0" + str(i)
    else:
        num = str(i);
    url = "http://www.serebii.net/pokemongo/pokemon/" + num + ".png"
    print("Fetching: " + url)
    r = requests.get(url)
    print(r.status_code);
    if r.status_code == 200:
        print("image fetched")
        filename = str(i) + ".png"
        with open(filename, 'wb') as f:
            f.write(r.content)
            f.close()

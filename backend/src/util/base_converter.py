def to_base52(number, padding=6):
    digitList = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    strep = ""
    while (number > 0):
        digit = number % len(digitList)
        strep += digitList[digit]
        number = number // len(digitList)
    strep = strep[::-1]
    return strep.rjust(padding, digitList[0])

def from_base52(string):
    digitList = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    number = 0
    for letter in string:
        number *= len(digitList)
        number += digitList.find(letter)
    return number


if __name__ == "__main__":
    temp = []

    for x in range(10000):
        displayVal, val = to_base52(x)
        temp.append((displayVal, x))
    
    for displayVal, actualVal in temp:
        assert from_base52(displayVal) == actualVal
    
    print("All ok!")
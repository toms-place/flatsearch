# wohnen-crawler
- crawls some websites for new apartments

# requirements
- nodejs - [download here](https://nodejs.org/en/download/)

# usage
1. add [mailAuth.json](#mailAuthjson) & [users.json](#usersjson)
2. npm install
3. npm start
4. leave it running, you get notified every 5 minutes if there is a new apartment

## mailAuth.json
- smtp Host
- User of Host
- Password of Host

```{
  "host": "",
  "user": "",
  "pass": ""
}```

## users.json
- User objects with:
- Name
- Email
- filter: [] Array of districts as Integers

```{
  "user1": {
    "name": "",
    "email": "",
    "filter": []
  }
}```
import asyncio
import websockets
import json
import re
#from argon2 import PasswordHasher
import mysql.connector
from pymongo import MongoClient

#ph = PasswordHasher()

def validEmailCheck(email):
    emailRegex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if re.match(emailRegex, email):
        return True
    else:
        return False

def validNameCheck(name):
    nameRegex = r'^[a-zA-Z0-9]+$'
    if re.match(nameRegex, name):
        return True
    else:
        return False


connection = mysql.connector.connect(
    host='',
    user='',
    password='',
    database=''
)

cursor = connection.cursor(dictionary=True)
activeSessions = {}


#create handler for each connection
async def handle_client(websocket, path):
    try:
        # keep listening for future client messages
        async for message in websocket:
            # data = await websocket.recv() - only for one time message
            data = json.loads(message)
            activeConnection = websocket
            serverCall = False

            if data["code"] == 600:
                if data["email"]:
                    args = (data["email"],)
                    cursor.callproc('emailCheck', args)
                    for result in cursor.stored_results():
                        row = result.fetchone()
                    # check if email is in use through MySql
                    if row['CODE'] == 309 and activeSessions[activeConnection] != data["email"]:
                        print("Email is NOT sessions AND email EXISTS!")
                        args = (data["email"], activeSessions[activeConnection])
                        cursor.callproc('friendshipCheck', args)
                        for result in cursor.stored_results():
                            row = result.fetchone()
                        print(row)
                        if row['CODE'] == 2:
                            #    Reply 602 to command code client
                            replyJson = {
                              "code": 602
                            }
                            # call createFriendship
                            reply = json.dumps(replyJson)
                            await websocket.send(reply)
                            print("Creating friendship...")
                            cursor.callproc('createFriendship', args)
                            # test all keys and see which value equals data["email"] then use that key to send a message
                            specialSession = 0
                            activeSessionsList = list(activeSessions.keys())
                            for i in activeSessionsList:
                                if activeSessions[i] == data["email"]:
                                    print(i)
                                    specialSession = i
                            mongoClient = MongoClient('mongodb://localhost:27017/')
                            nosqlDatabase = mongoClient['pesterchum']
                            settingsCollection = nosqlDatabase['settings']
                            settingsJson = settingsCollection.find_one({"email": activeSessions[activeConnection]},
                                                                       {'username'})
                            mongoClient.close()
                            replyJson = {
                              "code": 30000,
                              "username": settingsJson["username"],
                              "email": activeSessions[activeConnection]
                              # say who sent the code (email) while also giving username
                            }
                            # if other user online then send request
                            # currently we assume both users online for now
                            reply = json.dumps(replyJson)
                            print("1: ", websocket, path)
                            print("2: ", specialSession)
                            await specialSession.send(reply)
                            serverCall = True
                        if row['CODE'] == 1: 
                            cursor.callproc('whoSentIt', args)
                            for result in cursor.stored_results():
                                pending = result.fetchone()
                            print(pending['USER'])
                            print(activeSessions[activeConnection])
                            if pending['USER'] != activeSessions[activeConnection] and pending['USER'] != "accepted":
                                    specialSession = 0
                                    activeSessionsList = list(activeSessions.keys())
                                    for i in activeSessionsList:
                                        if activeSessions[i] == data["email"]:
                                            print(i)
                                            specialSession = i
                            #this needs to be the accept friendship part
                                    cursor.callproc('acceptFriendship', args)
                                    for result in cursor.stored_results():
                                        accepting = result.fetchone()
                                    if accepting['CODE'] != 604:
                                        print("got past 604 check from acceptFriendship")
                                        replyJson = {
                                          "code": 30002
                                        }
                                        reply = json.dumps(replyJson)
                                        await activeConnection.send(reply)
                                        serverCall = True

                            # code 603 to accepting client
                            # server needs to tell other client 30002 meaning friendship accepted
                            # update both clients tables
                                        print("new friendship created!")
                                        # send 603 to both which means populate tables!
                                        mongoClient = MongoClient('mongodb://localhost:27017/')
                                        nosqlDatabase = mongoClient['pesterchum']
                                        settingsCollection = nosqlDatabase['settings']
                                        accepterJson = settingsCollection.find_one({"email": activeSessions[activeConnection]},
                                                                                   {'username'})
                                        requesterJson = settingsCollection.find_one({"email": activeSessions[specialSession]},
                                                                                   {'username'})

                                        mongoClient.close()

                                        accepterJson = {
                                          "code": 603,
                                       #   "email": activeSessions[specialSession],
                                          "username": accepterJson["username"]
                                        }
                                        print("requester? ", activeSessions[specialSession])
                                        print("accepter? ", activeSessions[activeConnection])
                                        requesterJson = {
                                          "code": 603,
                                      #    "email": activeSessions[activeConnection],
                                          "username": requesterJson["username"]
                                        }
                                    #    print("1 ", specialSession)
                                    #    print("2 ", activeConnection)
                                        requesterReply = json.dumps(requesterJson)
                                        accepterReply = json.dumps(accepterJson)
                                        await specialSession.send(requesterReply)
                                        await websocket.send(accepterReply)

                            else:
                                print(" YOU CANT ACCEPT THE REQUEST YOU SENT FOOL")
                                replyJson = {
                                  "code": 604
                                }
                    else:
                        print("EMAIL NOT IN USE OR SAME AS SENDER")
                        replyJson = {
                          "code": 601
                        }
                else:
                    print("EMAIL IS BLANK")
                    replyJson = {
                      "code": 601
                    }
                if not serverCall:
                    reply = json.dumps(replyJson)
                    await activeConnection.send(reply)
                else:
                    serverCall = False

                #print("Friend Request Email Gotten")
                #print(data["email"])
                    #get email of 600 from sessionID
                    #
               # check if friendship IS in database, if not do this
               #    Reply 602 to command code client
               #    Send 30000 to email once it connects to server


               # if user accepts (30002) then reply to command code client
	       # update mysql with acceptFriendship
               # send to both currently connected clients the news with 603


            if data["code"] == 300:
                print(message)
                if data["email"]:
                    if data["password"]:
                        if data["name"]:
                            if validEmailCheck(data["email"]):
                                if validNameCheck(data["name"]):
                                    if len(data["password"]) >= 8:
                                        args = (data["email"],)
                                        cursor.callproc('emailCheck', args)
                                        for result in cursor.stored_results():
                                            row = result.fetchone()
                                            print(row)
                                        # check if email is in use through MySql
                                        if row['CODE'] == 305:
                                            mongoClient = MongoClient('mongodb://localhost:27017/')
                                            nosqlDatabase = mongoClient['pesterchum']
                                            settingsCollection = nosqlDatabase['settings']
                                            settingsJson = settingsCollection.find_one({"username": data["name"]}) 
                                            print(settingsJson)
                                            if settingsJson is None:
                                                regArgs = (data["email"],data["password"])
                                                cursor.callproc('registration', regArgs)
                                                newAccount = {
                                                  "email": data["email"],
                                                  "username": data["name"],
                                                  "color": [0, 0, 0]
                                                }
                                                result = settingsCollection.insert_one(newAccount)
                                                mongoClient.close()
                                                # Step 1.5: HASH AND SALT (not for testing)
                                                # Step 2: Create a new settings.json with the "title" being the email and input a blank color and the correct username
                                                # Step 4: client should go to login page and it should all work!

                                                replyJson = {
                                                  "code": 309
                                                }
                                            else:
                                                mongoClient.close()
                                                print("username is in use...")
                                                replyJson = {
                                                  "code": 304
                                                }
                                           # now create account here!
                                        else:
                                            print("email is in use...")
                                            replyJson = {
                                              "code": 305
                                            }
                                    else:
                                        print("password no minimum requirements")
                                        replyJson = {
                                          "code": 308
                                        }
                                else:
                                    print("Name Bad Syntax")
                                    replyJson = {
                                     "code": 307
                                    }
                            else:
                                print("EMAIL BAD SYNTAX")
                                replyJson = {
                                  "code": 306
                                }
                        else:
                            print("USERNAME BLANK")
                            replyJson = {
                              "code": 303
                            }
                    else:
                        print("PASS BLANK")
                        replyJson = {
                          "code": 302
                        }
                else:
                    print("EMAIL IS BLANK")
                    replyJson = {
                      "code": 301
                    }
               # somewhere here check if email verification happens but DONT CARE YET
                reply = json.dumps(replyJson)
                await websocket.send(reply)
            if data["code"] == 200:
                #rep = f"Accepted Client Code: {message}!"
                replyJson = {
                  "code": 202,
                }
             #    print(json.dumps(data["version"]))
                reply = json.dumps(replyJson)
                # reply = f"202"
                await websocket.send(reply)
                print(message)
                print("Connected to Client with Version: " + data["version"])
            if data["code"] == 100:
                # rep = f"Got Login Request"
                # based on mysql reply either deny with 101 or 102
                print(json.dumps(data))
                # check if email is legit (has @ sign)
                if validEmailCheck(data["email"]):
                    print("EMAIL IS GOOD ")
                     # check if password has minimum requirements (not yet)
                    if len(data["password"]) >= 8:
                        print("PASSWORD LENGTH GOOD")
                        # hash and salt password
                        #hashedPass = ph.hash(data["password"])
                        # COMPLETE DELETE normal password storage HERE (garbage collector)
                        #print(hashedPass)
                        # send to mysql
                        procedureArgs = (data["email"], data["password"])
                        cursor.callproc('loginCheck', procedureArgs)
                        # DELETE HASHED PASSWORD AFTER SQL SEND HERE (garbage collector)
                        for result in cursor.stored_results():
                            row = result.fetchone()
                            print(row)
                            if row['CODE'] == 102:
                                print("SUCCESFULLY LOGIN SEND TO NOSQL!")
                                # get settings.json from nosql
                                # for user from data["email"]
                                mongoClient = MongoClient('mongodb://localhost:27017/')
                                nosqlDatabase = mongoClient['pesterchum']
                                settingsCollection = nosqlDatabase['settings']
                                settingsCollection = nosqlDatabase['settings']
                                settingsJson = settingsCollection.find_one({"email": data["email"]}) 
                                mongoClient.close()
                                print(settingsJson)
                                finalArgs = (data["email"],)
                                cursor.callproc('getFriendsOf', finalArgs)
                                for result in cursor.stored_results():
                                    row = result.fetchone()
                                    print(row)
                                # check for pending friend requests
                                # send friend list and requests
                                replyJson = {
                                  "code": 102,
                                  "username": settingsJson["username"],
                                  "color": settingsJson["color"],
                                  "friends": [{"username": "a"}, {"username": "b"}]
                                }
                                #activeConnection = websocket.remote_address
                                #print(activeConnection)
                                # create hashmap that stores ipaddr and ip port as key
                                # and value as email, and maybe more in future in the value
                                if activeConnection in activeSessions:
                                    print("already exists in dictionary")
                                else:
                                    activeSessions[activeConnection] = data["email"]
                                for key, value in activeSessions.items():
                                    print(f"{key}: {value}")
                            else:
                                print("101 tell client no good")
                                replyJson = {
                                  "code": 101
                                }
                    else:
                        print("PASSWORD LENGTH NO GOOD")
                        replyJson = {
                          "code": 103
                        }
                else:
                    print("EMAIL IS BADDDDDDDDDD")
                    replyJson = {
                      "code": 101
                    }
 #               reply = f"102"
                reply = json.dumps(replyJson)
                await websocket.send(reply)
                print (message)
               # print("Logged in Client!")
    except websockets.ConnectionClosed as e:
        if activeSessions is not None:
            del activeSessions[activeConnection]
            print(f"Client {activeConnection } disconnected with reason: {e.reason}")
        if activeSessions == {}:
            print("Currently No One Connected!")
        else:
            for key, value in activeSessions.items():
                print(f"{key}: {value}")


async def start_server():
    server = await websockets.serve(handle_client, "192.168.1.42", 1111)
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(start_server())

#asyncio.get_event_loop().run_until_complete(start_server)
#asyncio.get_event_loop().run_forever()




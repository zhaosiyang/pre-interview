# Steps to run the server:
1. download/clone the repo
2. cd to the main directory
3. run $ npm install
4. run $ node server

# The user database schema
- name: string
- imageUrl: string

# User related APIs
1. GET: `/api/users`
    - explanation: get all users documents
2. GET: `/api/materials/:UID`   (e.g. GET: /api/materials/120)
    - explanation: get the document of a user specified by UID.
3. POST: `/api/users`
    - explanation: create a new material, mainly for admin
    - content-type should be multupart/form-data
    - payload: 1. name: the name of the new user; 2. file: the image file of the new user
4. PUT: `/api/users/:UID`
    - explanation: update the info of the user specified by UID
    - payload is the new key-value pairs you want to update to.
5. DELETE: `/api/users/:UID`
    - explanation: delete the user specified by UID
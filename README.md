# Cloud Developer Nanodegree: Capstone Project

This project was developed in tandem with the React Nanodegree second project: [Would You Rather](https://github.com/scgerkin/reactnd-02-would-you-rather). This application serves as a serverless backend for persisting information created and displayed in that application.

The client application is currently hosted at [https://wyr.scgrk.com](https://wyr.scgrk.com)

To try out the client locally:
```sh
git clone https://github.com/scgerkin/reactnd-02-would-you-rather.git
cd reactnd-02-would-you-rather
npm install
npm start
```
(As a note, if you `Logout` of the application while running locally, Auth0 will redirect you to the deployed application)

Additionally, there is a [Postman collection](./wyr.postman_collection.json) for purely testing the backend included. Authentication to use some backend methods is required, so not all methods can be demonstrated with Postman alone without using the client application (either locally or as hosted) to first get an authorization token.

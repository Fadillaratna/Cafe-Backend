// const vault = require("node-vault")({
//   apiVersion: "v1",
//   endpoint: "http://127.0.0.1:8200",
// });

// const roleId = '09fc4010-cc3e-f2da-21a6-aa76e942a055';
// const secretId = 'aa8265df-23e5-3a43-0f1c-5e7017224362';

// const run = async () => {
//   const result = await vault.approleLogin({
//     role_id: roleId,
//     secret_id: secretId,
//   });

//   vault.token = result.auth.client_token; // Add token to vault object for subsequent requests.

//   const { data } = await vault.read("secret/data/mysql/webapp"); // Retrieve the secret stored in previous steps.

//   const databaseName = data.data.db_name;
//   const username = data.data.username;
//   const password = data.data.password;

//   console.log({
//     databaseName,
//     username,
//     password,
//   });

//   console.log("Attempt to delete the secret");

//   await vault.delete("secret/data/mysql/webapp"); // This attempt will fail as the AppRole node-app-role doesn't have delete permissions.
// };

const run = async () => {
  var options = {
    apiVersion: 'v1', // default
    endpoint: 'http://127.0.0.1:8200', // default
    token: 'eazyapi' // optional client token; can be fetched after valid initialization of the server
  };
  
  // get new instance of the client
  var vault = require("node-vault")(options);
  const { data } = await vault.read("secret/data/mongo/db");
  console.log(data)
}

module.exports = {
  run
}
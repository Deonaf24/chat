import { apiClient } from "./client.ts";


// Make a request for a user with a given ID
apiClient.get('/healthz')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .finally(function () {
    // always executed
  });
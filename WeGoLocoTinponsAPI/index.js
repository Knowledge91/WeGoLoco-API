'use strict';
var mysql = require('promise-mysql');

var connection, tinpon, tinponBasics, tinponVariations, tinponId;
let host = "wegoloco-cluster.cluster-cb5jwvcwolur.eu-west-1.rds.amazonaws.com";
let user = "admin";
let password = "1269Y5$ST50j";
let database = 'wegoloco';
let charset = 'utf8mb4';
// git test
function respond(context, statusCode, body) {
  let response = {
      statusCode: statusCode,
      headers: {
          "x-custom-header" : "custom header value"
      },
      body: body
  };

  context.succeed(response);
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return JSON.stringify(obj) === JSON.stringify({});
}

exports.handler = (event, context, callback) =>  {
  console.log("Lambda started");

  // init params
  /////////////////////////////////////////////////////////////////////////////
  var requestBody, pathParams, queryStringParams, headerParams, stage,
  stageVariables, cognitoIdentityId, httpMethod, sourceIp, userAgent,
  requestId, resourcePath;
  console.log("Request: " + JSON.stringify(event));

  // Request Body
  requestBody = event.body;

  // Path Parameters
  pathParams = event.path;

  // Query String Parameters
  queryStringParams = event.queryStringParameters;

  // Header Parameters
  headerParams = event.headers;

  if (event.requestContext !== null && event.requestContext !== undefined) {

      var requestContext = event.requestContext;

      // API Gateway Stage
      stage = requestContext.stage;

      // Unique Request ID
      requestId = requestContext.requestId;

      // Resource Path
      resourcePath = requestContext.resourcePath;

      var identity = requestContext.identity;

      // Amazon Cognito User Identity
      cognitoIdentityId = identity.cognitoIdentityId;

      // Source IP
      sourceIp = identity.sourceIp;

      // User-Agent
      userAgent = identity.userAgent;
  }

  // API Gateway Stage Variables
  stageVariables = event.stageVariables;

  // HTTP Method (e.g., POST, GET, HEAD)
  httpMethod = event.httpMethod;

  // end init params
  /////////////////////////////////////////////////////////////////////////////

  console.log("HTTP method : ",httpMethod);
  console.log("Path params : ", pathParams);
  switch(pathParams) {
    case "/tinpons" :
      switch (httpMethod) {
        case "GET":
          console.log("GET case");
          mysql.createConnection({
              host: host,
              user: user,
              password: password,
              database: database,
              charset: charset
          })
          .then( function(conn) {
            connection = conn;
            const tinponId = queryStringParams.tinponId;

            var query = connection.query("SELECT tinpon.id, tinpon.name, tinpon.category_id, tinpon.price, tinpon.updated_at, tinpon.created_at, Count(*) as mainImageCount FROM tinpon LEFT JOIN tinpon_image ON tinpon.id = tinpon_image.tinpon_id WHERE tinpon.id = '"+tinponId+"';");
            return query;
          })
          .then( function(result) {
            connection.end()
            respond(context, 200, JSON.stringify(result[0]));
          })
        break;
        case "POST":
          console.log("POST case");

          tinpon  = JSON.parse(requestBody);
          tinponVariations = tinpon.variations;
          tinponBasics = tinpon;
          delete tinponBasics.variations;
          // console.log("tinponVariations:", tinponVariations);

          mysql.createConnection({
              host: host,
              user: user,
              password: password,
              database: database,
              charset: charset
          }).then(function(conn){
              // insert TinponBaiscs
              connection = conn;

              var query = connection.query("INSERT INTO tinpon SET ?", tinponBasics);
              console.log("SQL QUERY : ", query.sql);
              return query;
          }).then( function(result) {
            // Insert variations
            tinponId = result.insertId;

            var values = "";
            tinponVariations.forEach( function(variation) {
              // console.log("variation", variation);
              let color = variation.color;
              let sizeType = Object.keys(variation.size)[0];
              let size = variation.size[sizeType];
              console.log("sizeType and size", sizeType, size);
              let quantity = variation.quantity;

              values = values.concat("('"+tinponId+"', '"+color+"', '"+size+"', '"+sizeType+"', '"+quantity+"'),");
            });

            if (values != "") {
              values = values.slice(0, -1);

              var query = connection.query("INSERT INTO tinpon_variation(tinpon_id, color, size, size_type, quantity)"+
                          "VALUES "+values+";");
              return query;
            } else {
                connection.end();
                respond(context, 200, tinponId);
            }
          }).then( function(result) {
            connection.end();
            // on success return TINPON ID
            respond(context, 200, tinponId);
          });
          break;
        }
        break;
    case "/tinpons/not-swiped" :
      console.log("Not Swiped Tinpons");
      mysql.createConnection({
          host: host,
          user: user,
          password: password,
          database: database,
          charset: charset
      }).then(function(conn){
          // insert TinponBaiscs
          connection = conn;

          var query = connection.query("SELECT * FROM tinpon LIMIT 10;");
          return query;
      }).then(function(result){
        connection.end();
        // on success return TINPON ID
        respond(context, 200, JSON.stringify(result));
      });
      break;
    default :
      respond(context, 500, "Not a valid resoucrce called");
  }
};


console.log('Cash App Demo')

const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');
const express = require('express');
const bodyParser= require('body-parser');
const initTracer = require("jaeger-client").initTracer;
const app = express();

const config = {
  serviceName: "CashFront",
  reporter: {
    logSpans: true,
    collectorEndpoint: "http://jaeger-collector-jaeger.apps.na311.openshift.opentlc.com/api/traces"
    //agentHost: "localhost",
    //agentPort: 6832
  },
  sampler: {
    type: "const",
    param: 1.0
  }
};

const options = {
  tags: {
    "cash-front.version": "1.0.0"
  }
};

const tracer = initTracer(config, options);

var request = require('request')

  app.set('view engine', 'ejs')

  app.use(express.static('web'));
  app.use(bodyParser.urlencoded({extended: true}))

  app.listen(8080, function() {
    console.log('listening on 8080')
  })

  app.get('/', function (req, res) {
    span = tracer.startSpan("App-Status");
    span.log({ foo: "bar" });
    console.log("do stuff...");
    res.send('Cash App Status [Running]')
    span.finish();
  })

  app.get('/new', function (req, res) {
    const method = 'GET';
    const headers = {};
    span = tracer.startSpan("App-Init");
    span.setTag(Tags.HTTP_URL, '/new');
    span.setTag(Tags.HTTP_METHOD, method);
    span.setTag(Tags.SPAN_KIND, Tags.SPAN_KIND_RPC_CLIENT);
    tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
    request.get({
      headers: headers,
      url:'http://cash-back-inno-apps.apps.na311.openshift.opentlc.com/payments'
    }, function(err, response, body){
      if (err) return console.log(err)
      console.log('Respons Is -->' + response.statusCode)
      console.log(body)
      res.render('main.ejs', {payments: JSON.parse(body)})
    });
    span.finish();
  })

  app.post('/postPayment', (req, res) => {
    const method = 'POST';
    const headers = {'content-type' : 'application/json'};
    span = tracer.startSpan("App-Post-Paymnt");
    span.setTag(Tags.HTTP_URL, '/postPayment');
    span.setTag(Tags.HTTP_METHOD, method);
    span.setTag(Tags.SPAN_KIND, Tags.SPAN_KIND_RPC_CLIENT);
    tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
    console.log(req.body)
    request.post({
      headers: headers,
      url: 'http://cash-back-inno-apps.apps.na311.openshift.opentlc.com/payment',
      body: JSON.stringify(req.body)
    }, function(error, response, body){
      if (error) return console.log(err)
      console.log('Message Published Successfully' + body);
      res.redirect('/new')
    });
    span.finish();
  })

  app.post('/print', (req, res) => {
    const method = 'GET';
    const headers = {};
    span = tracer.startSpan("App-Print-Pymnts");
    span.setTag(Tags.HTTP_URL, '/print');
    span.setTag(Tags.HTTP_METHOD, method);
    span.setTag(Tags.SPAN_KIND, Tags.SPAN_KIND_RPC_CLIENT);
    tracer.inject(span, FORMAT_HTTP_HEADERS, headers);
    request.get({
      headers: headers,
      url:'http://cash-back:8080/generr'
    }, function(err, response, body){
      if (err) return console.log(err)
      console.log('Respons Is -->' + response.statusCode)
      console.log(body)
    });
    span.finish();
  })
  

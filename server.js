//priyankakushwaha533@gmail.com

const express = require("express");
const app = express();
const server = require("http").Server(app);
const request = require("request");
const  bodyParser = require("body-parser");
const https = require("https");

/////////////////////////////////////////////////////////////////////////////

app.set("view engine", "ejs");

const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});

////////////////////////////////////////////////////////////////////////////

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use(bodyParser.urlencoded({extended:true}));
app.use("/peerjs", peerServer);
app.use(express.static("public"));

/////////////////////////////////////////////////////////////////////////////

app.get("/",function(req,res)
{
  res.sendFile(__dirname+"/views/index.html");
  
});

////////////////////////////////////////////////////////////////////////////

app.get("/room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

app.post("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room});
});

////////////////////////////////////////////////////////////////////////////

app.post("/",function(req,res)
{
  const name = req.body.first;
  const sirname = req.body.last;
  const email = req.body.e;
  const data = {
    members:[{ email_address: email,
               status: "subscribed",
               merge_fields:{FNAME: name,
                             LNAME: sirname}
            }]
  };

  const jsonData = JSON.stringify(data);
  const url = "https://us10.api.mailchimp.com/3.0/lists/dd67644160";
  const options = { method: "POST",
                    auth:"pr1:8f71e0a6f1a402f8333273a965d6b86d-us10"
                  }
  const request = https.request(url,options,function(response)
  {  
        res.render("room", { roomId: req.params.room });
  }

////////////////////////////////////////////////////////////////////////////

    ,res.on("data",function(data)
      {    console.log(JSON.parse(data));
      })
    );
  request.write(jsonData);
  request.end();

});


///////////////////////////////////////////////////////////////////////////

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
    socket.on('disconnect', (userId) => {
      socket.to(roomId).emit('user-disconnected', userId)
    });
  });
});

///////////////////////////////////////////////////////////////////////////

server.listen(process.env.PORT || 3030);
(function ($) {
//console.log("stream is loaded ")
$.fn._vs.token = {

    // alias for d3 color scale D3
    colorRange:function(){},
    
    init:function(_this){
      // Color scale import form d3 
      // todo shape management
      this.colorRange = _this.settings.chart.colorRange
    },

    selectAll:function(_this,key,value){
      // DRAFT VERSION writing select All ...... 
      var result = []
      var all    = false
      result.flocculate  = function(){
        var r=[]
        result.forEach(function(i){
          q = i.flocculate()
          r.push(q)
        })
        return r
      }
      result.attr  = function(key,value,param){
        var r=[]
        result.forEach(function(i){
          //console.log(key,value,param)
          q = i.attr(key,value,param)
          //console.log("q",q)
          r.push(q)
        })
        return r
      }

      if(typeof(value) == "undefined" && typeof(key) == "undefined"){ 
        all =true
      }
      
      for (var i = _this.tokens.length - 1; i >= 0; i--) {
        if(_this.tokens[i].attr(key) == value || all==true){
          result.push(_this.tokens[i])
       }
      }

      if(typeof(result[0])=="undefined"){
        return false
      }else{
        return result;
      }

    },

    select:function(_this,key,value){
      result = []
      if(typeof(value) == "undefined" && typeof(key) == "undefined"){ 
        return _this.tokens 
      }else{
        for (var i = _this.tokens.length - 1; i >= 0; i--) {
          if(_this.tokens[i].attr(key) == value){
            result.push(_this.tokens[i])
            break;
          }
        }
      }
      if(typeof(result[0])=="undefined"){
        return false
      }else{
        return result[0];
      }
    },


    addToken:function (_this,element){
     //default token setting  
     var defaultTokenSetting ={
        x:50,y:50, // positions
        // Graphic Parameter
        size:10,   fillStyle:'#000000',  strokeStyle:'#000000', lineWidth:0, texture:undefined,
        shape:'round', // square, round, ?? svg path with json serialisation {}
        // Data 
        timestamp:null,
        categorie:1,
        userdata:{},
        // Interactions callbacks 
        callback:{}, 
        // Physical 
        phy:{ density:10,friction:0,restitution:0},
        targets:[/*{x:null,y:null}*/],
        elbow:{/*x:null,y:null*/}
     }
     var result = null;
     var myobj = null
     var token = function (){}

     //console.log(element)
     if(typeof(element)=='undefined'){
        token.setting = defaultTokenSetting
     } else {
        token.setting   = element
        if(typeof(token.setting.phy)    =='undefined') {token.setting.phy    = defaultTokenSetting.phy}
        if(typeof(token.setting.x)      =='undefined') {token.setting.x      = _this.settings.sedimentation.incoming.point[element.categorie].x+(Math.random()*2)}
        if(typeof(token.setting.y)      =='undefined') {token.setting.y      = _this.settings.sedimentation.incoming.point[element.categorie].y+(Math.random()*2)}
        if(typeof(token.setting.size)   =='undefined') {token.setting.size   = _this.settings.sedimentation.token.size.original}
        if(typeof(token.setting.targets)=='undefined') {token.setting.targets=[]}
      }
      token.myobj =  this.create(_this,token.setting)    
      //console.log("token.myobj",token.myobj)

          token.flocculate = function(){
            _this.tokens.indexOf(this)
            _this.flocculate.destroyIt(_this,this)
           return this
          }

          token.attr = function(key,value,param){
            //console.log("attr",this.myobj)
            if(typeof(value) == "undefined"){
              if(typeof(this[key])!="undefined"){
               return this[key]()
              }else{
               return this.myobj.m_userData[key]
              }
            }else{
             if(typeof(this[key])!="undefined"){
              this[key](value,param)
             }else{
              this.myobj.m_userData[key]=value
            }
           }
           return this
          }

          token.callback = function(value,param){
            if (!arguments.length){return this.myobj.m_userData.callback}
            if (typeof(this.myobj.m_userData.callback[value])=="function"){
              return this.myobj.m_userData.callback[value](param)
            } else {
              return function(param){console.log("callback undefined")}
            }
          }
          
          token.size = function(value){
            if(this.myobj!=null){
              if (!arguments.length){return this.myobj.m_shape.m_radius*this.myobj.m_userData.scale;}
                this.myobj.m_shape.m_radius = value/this.myobj.m_userData.scale
            }
          }
      
          token.texture = function(value){
            if (!arguments.length){return this.myobj.m_userData.texture.img.src;}
             console.log("texture",value)
             this.myobj.m_userData.texture={}
             this.myobj.m_userData.texture.img = new Image();
             this.myobj.m_userData.texture.img.src = value
          }

      //console.log("token",token)
      _this.tokens.push(token)
      _this.decay.tokens.push(token)
     return token
    },

    // CREATE IS A TRY TO UNIFY TOKEN PRODUCTION
    create:function(_this,token) {
      //targetX,targetY, x, y,size,family
      //console.log("create",token)
      token.scale = scale = _this.settings.options.scale

      //console.log("DBT")
      var xPos              = token.x/scale+(Math.random()*0.1);
      var yPos              = token.y/scale+(Math.random()*0.1);

      // CREATE BALL
      var fixDef            = new Box2D.Dynamics.b2FixtureDef;
        fixDef.density      = 0.1;
        fixDef.friction     = 0.0;
        fixDef.restitution  = 0.0;
        fixDef.shape        = new Box2D.Collision.Shapes.b2CircleShape(token.size/scale);

      var bodyDef           = new Box2D.Dynamics.b2BodyDef;
        bodyDef.type        = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position.x  = token.x/scale;//+(Math.random())
        bodyDef.position.y  = token.y/scale;
      
      this.myobj = _this.world.CreateBody(bodyDef).CreateFixture(fixDef)

      if(typeof(token.texture)!="undefined"){
        token.texture.img = new Image();
        token.texture.img.src = token.texture.src
      }
      
      if(typeof(token.impulse)!="undefined"){
        this.applyImpulse(this.myobj,token.impulse.angle,token.impulse.power);
      }

      if(typeof(token.fillStyle) =="undefined"){   token.fillStyle  = this.colorRange(token.categorie) }
      if(typeof(token.stokeStyle)=="undefined"){   token.stokeStyle = this.colorRange(token.categorie) }
      if(typeof(token.lineWidth) =="undefined"){   token.lineWidth  = 0 }
      if(typeof(token.callback)  =="undefined"){   
        token.callback = {}
                   // {
                   //      suspension:undefined,
                   //      flocculation:undefined,
                   //      draw:undefined,
                   //      mouseover:undefined,
                   //      mouseout:undefined,
                   //      click:undefined
                   //    }
      }

      this.myobj.m_userData       = token 
      this.myobj.attr             = this.attr// function (){console.log(this)} 
      this.myobj.m_userData.mouse = {}
      this.myobj.m_userData.mouse.over        = false;
      this.myobj.m_userData.mouse.down        = false;
      this.myobj.m_userData.mouse.dragging    = false;
      this.myobj.m_userData.mouse.statebefore = false;

      // Execute suspension callback 
      if(typeof(this.myobj.m_userData.callback)!="undefined"){
        if(typeof(this.myobj.m_userData.callback.suspension)=="function"){
           this.myobj.m_userData.callback.suspension(this.myobj.m_userData)         
        }
      }

      if(token.targets.length==0 && _this.settings.chart.type=="CircleLayout"){
        token.targets[0]={
                         x: _this.settings.sedimentation.incoming.target[token.categorie].x,
                         y: _this.settings.sedimentation.incoming.target[token.categorie].y
                  }
      }

      if(token.targets.length>0){
        //console.log()
        //CREATE JOIN MOUVEMENT TO TARGET
        var md              = new _this.phy.b2MouseJointDef();
        md.bodyA            = _this.world.GetGroundBody();
        md.bodyB            = this.myobj.GetBody();
        md.target.Set(xPos,yPos);
        md.collideConnected = true;
        md.maxForce         = 50 * this.myobj.GetBody().GetMass();
        mouseJoint          = _this.world.CreateJoint(md);
        mouseJoint.SetTarget(new _this.phy.b2Vec2(token.targets[0].x/scale, token.targets[0].y/scale));
      }

      // ADD INFO IN OBJECT
      //categories[family].value+=1;
      //setTimeout(function(){mouseJoint.SetTarget(chart.position.x/scale, chart.position.y/scale)},1000);
      //categories[family].joins.push(mouseJoint); 
    
      return this.myobj;
    },

    applyImpulse:function(bodyId, degrees, power) {
    var body = bodyId.GetBody();
    body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(Math.cos(degrees * (Math.PI / 180)) * power,
                                 Math.sin(degrees * (Math.PI / 180)) * power),
                                 body.GetWorldCenter());
    },

    createDataBarBall:function (_this, x, y,size,family) { 
      //console.log(Math.round(family)) ;
      var fixDef = new Box2D.Dynamics.b2FixtureDef;
        fixDef.density = 10.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;
        fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(size/_this.settings.options.scale);
    
      var bodyDef = new Box2D.Dynamics.b2BodyDef;
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position.x = x/_this.settings.options.scale;//+(Math.random())
        bodyDef.position.y = y/_this.settings.options.scale;
    
      var myobj = _this.world.CreateBody(bodyDef).CreateFixture(fixDef)
      myobj.m_userData={type:"BarChartBall",
                familyID:'family',
                fillColor:this.colorRange(family)} //dynamiq
      //console.log(myobj);
      return myobj;
    },


    // ....................................................................
    // Physicals elements 
    // !!!!!!!!!!!!!!!!!!   Have to clean 
    // ....................................................................

    // !!!!!!!!!! To mix withe the one in piechart and bar chart ::: createBox
    createBox:function (world, x, y, width, height, angle, fillColor, fixed) {
      if (typeof(fixed) == 'undefined') fixed = true;
       var fixDef       = new b2FixtureDef;
      if (!fixed) fixDef.density = 100.0;
       fixDef.friction    = 0.6;
       fixDef.restitution   = 0.3;
       
       var bodyDef      = new b2BodyDef;
       bodyDef.type     = b2Body.b2_staticBody;
       bodyDef.angle    = angle ;//* b2Settings.b2_pi; 
       fixDef.shape     = new b2PolygonShape;
       fixDef.shape.SetAsBox(width/scale, height/scale);
       bodyDef.position.Set(x/scale, y/scale);
       var myobj        = world.CreateBody(bodyDef).CreateFixture(fixDef)
       myobj.m_userData   = {type:"Wall",fillColor:fillColor}
       console.log(myobj.m_userData)
       return myobj;
       
    },
    createBoxPie:function (world,axis, x, y, width, height, angle, fillColor) {
      var bodyDef     = new b2BodyDef;
        bodyDef.type    = Box2D.Dynamics.b2Body.b2_dynamicBody;
      var fixDef      = new Box2D.Dynamics.b2FixtureDef;
      fixDef.shape    = new b2PolygonShape;
      fixDef.shape.SetAsBox(width/scale, height/scale);
        fixDef.density      = 1000000.0;
        fixDef.friction     = 0.5;
        fixDef.restitution  = 0.2;
        bodyDef.position.Set(x/scale, y/scale);
      bodyDef.angle     = 0;
      var myobj       = world.CreateBody(bodyDef).CreateFixture(fixDef);
      myobj.m_userData  = {type:"Wall",fillColor:fillColor}
    
       return myobj;
       
    },
    createBox0D:function (world, x, y, width, height, fixed) {
      if (typeof(fixed) == 'undefined') fixed = true;
      var boxSd = new b2BoxDef();
      boxSd.restitution = -0.6;
      boxSd.friction = .3;
      if (!fixed) boxSd.density = 0.01;
      boxSd.extents.Set(width, height);
      var boxBd = new b2BodyDef();
      boxBd.AddShape(boxSd);
      boxBd.position.Set(x,y);
      return world.CreateBody(boxBd)
    },
    createHiddenBox:function (world, x, y, width, height, fixed) {
      if (typeof(fixed) == 'undefined') fixed = true;
      var boxSd = new b2BoxDef();
      boxSd.restitution = 0.6;
      boxSd.friction = .3;
      if (!fixed) boxSd.density = 1.0;
      boxSd.extents.Set(width, height);
      var boxBd = new b2BodyDef();
      boxBd.AddShape(boxSd);
      boxBd.position.Set(x,y);
      var myObject = world.CreateBody(boxBd)
      myObject.m_shapeList.visibility = 'hidden'; 
      console.log(myObject);
      return myObject
      
    },
    createBigBall:function (world, x, y) { 
      var fixDef       = new Box2D.Dynamics.b2FixtureDef;
        fixDef.density     = 1000000.0;
        fixDef.friction    = 0.5;
        fixDef.restitution = 0.2;
        fixDef.shape     = new Box2D.Collision.Shapes.b2CircleShape(
      20/30
        );
    
        var bodyDef      = new Box2D.Dynamics.b2BodyDef;
      bodyDef.type     = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position.x = x;
        bodyDef.position.y = y;
      var myobj = world.CreateBody(bodyDef).CreateFixture(fixDef)
      //console.log(myobj)
      return myobj;
    },
    
    /*
    286
        Create standard boxes of given height , width at x,y
    287
    */
    
    createPieBox:function (world, x, y, width, height,rotation,color, options){
    
      //default setting
    
     options = $.extend(true, {
         'density':10000000.0 ,
         'friction':1.0 ,
         'restitution':0.2 ,
         'linearDamping':0.0 ,
         'angularDamping':0.0 ,
         'gravityScale':0.0 ,
         'type':b2Body.b2_dynamicBody
     }, options);
    
    
     var body_def       = new b2BodyDef();
     var fix_def      = new b2FixtureDef;
     fix_def.density    = options.density;
     fix_def.friction     = options.friction;
     fix_def.restitution  = options.restitution;
     fix_def.shape      = new b2PolygonShape();
     fix_def.shape.SetAsBox( width/scale , height/scale );
     body_def.position.Set(x/scale , y/scale);
     body_def.linearDamping = options.linearDamping;
     body_def.angularDamping = options.angularDamping;
     body_def.angle     = rotation;
    
     body_def.type      = options.type;
     var b          = world.CreateBody( body_def );
     var f          = b.CreateFixture(fix_def);
     f.m_userData     = {type:"box",familyID:null,fillColor:color}
    
     return b;
    
    },
     
    createPolygon:function (world,x,y,points,rotation,color){
      
      var bodyDef     = new b2BodyDef();
      var fixDef      = new b2FixtureDef();
        fixDef.density    = 0.1;
        fixDef.friction   = 0.0;
        fixDef.restitution  = 0.0;
      if(points==null){var points = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y:2}]};
    
      for (var i = 0; i < points.length; i++) {
          var vec = new b2Vec2();
          vec.Set(points[i].x/scale, points[i].y/scale);
          points[i] = vec;
      }
      
      fixDef.shape    = new b2PolygonShape;
      fixDef.shape.SetAsArray(points, points.length);
      bodyDef.position.x  = x/scale;
      bodyDef.position.y  = y/scale;
      var myobj       = world.CreateBody(bodyDef).CreateFixture(fixDef);
      myobj.m_userData  = {type:"Polygon",familyID:null,fillColor:color}
      return bodyDef;
    
    },

    createDataBallTarget:function (world,targetX,targetY, x, y,size,family) {
      //console.log("DBT")
      var xPos              = x/scale+(Math.random()*0.1);
      var yPos              = y/scale+(Math.random()*0.1);

      // CREATE BALL
      var fixDef            = new Box2D.Dynamics.b2FixtureDef;
        fixDef.density      = 0.1;
        fixDef.friction     = 0.0;
        fixDef.restitution  = 0.0;
        fixDef.shape        = new Box2D.Collision.Shapes.b2CircleShape(size/scale);
        var bodyDef         = new Box2D.Dynamics.b2BodyDef;
      bodyDef.type          = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position.x  = xPos;
        bodyDef.position.y  = yPos;
        var myobj           = world.CreateBody(bodyDef).CreateFixture(fixDef);
      
      //CREATE JOIN MOUVEMENT TO TARGET
      var md                = new b2MouseJointDef();
        md.bodyA            = world.GetGroundBody();
        md.bodyB            = myobj.GetBody();
        md.target.Set(xPos,yPos);
        md.collideConnected = true;
        md.maxForce         = 50* myobj.GetBody().GetMass();
        mouseJoint          = world.CreateJoint(md);
      mouseJoint.SetTarget(new b2Vec2(targetX/scale, targetY/scale));
    
      // ADD INFO IN OBJECT
      myobj.m_userData  = {type:"PieBall",familyID:family,fillColor:colorScale(family)}
      categories[family].value+=1;
      //setTimeout(function(){mouseJoint.SetTarget(chart.position.x/scale, chart.position.y/scale)},1000);
      categories[family].joins.push(mouseJoint); 
    
      return myobj;
    },
    
    createDataBallPie:function (world,target, x, y,size,family) {
      console.log(target)
      var xPos = categories[family].incomingPoint.x/scale+(Math.random()*2/scale);
      var yPos = categories[family].incomingPoint.y/scale;
    
      // CREATE BALL
      var fixDef           = new Box2D.Dynamics.b2FixtureDef;
        fixDef.density     = 0.1;
        fixDef.friction    = 0.0;
        fixDef.restitution = 0.0;
        fixDef.shape       = new Box2D.Collision.Shapes.b2CircleShape(size/scale);
    
        var bodyDef = new Box2D.Dynamics.b2BodyDef;
      bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    
        bodyDef.position.x = xPos;
        bodyDef.position.y = yPos;
    
      // I need a distinct list with bodies (and not fixtures)
      var myo = world.CreateBody(bodyDef);
        myo.m_userData={type:"PieBall",familyID:family,fillColor:categories[family].color}
        
        listBodies.push(myo);
      var myobj = myo.CreateFixture(fixDef);
      
      //CREATE JOIN MOUVEMENT TO TARGET
      var md = new b2MouseJointDef();
        md.bodyA = world.GetGroundBody();
        md.bodyB = myobj.GetBody();
        md.target.Set(xPos,yPos);
    
        md.collideConnected = true;
        md.maxForce = 100* myobj.GetBody().GetMass();
        mouseJoint = world.CreateJoint(md);
      mouseJoint.SetTarget(new b2Vec2(target.position.x/scale, target.position.y/scale));
      
      // ADD INFO IN OBJECT
      myobj.m_userData={type:"PieBall",familyID:family,fillColor:colorScale(family)}
      categories[family].value+=1;
      //setTimeout(function(){mouseJoint.SetTarget(chart.position.x/scale, chart.position.y/scale)},1000);
    
      return myobj;
    },
    
    createDataBall:function (_this, x, y,size) { 
      var fixDef      = new Box2D.Dynamics.b2FixtureDef;
        fixDef.density    = 1.0;
        fixDef.friction   = 0.5;
        fixDef.restitution  = 0.2;
        fixDef.shape    = new Box2D.Collision.Shapes.b2CircleShape(size/_this.settings.options.scale);
    
      var bodyDef = new Box2D.Dynamics.b2BodyDef;
      bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position.x = x;//+(Math.random())
        bodyDef.position.y = y;
    
      var myobj = _this.world.CreateBody(bodyDef).CreateFixture(fixDef)
      myobj.m_userData={type:"PieBall",
                familyID:'family',// add family ///
                fillColor:"rgb(200,0,0)"}// add color 
    
      //console.log(myobj)
      return myobj;
    },

    getToken:function (){

    }
}

})(jQuery);

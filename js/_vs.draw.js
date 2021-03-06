(function ($) {
  
$.fn._vs.draw = {

    settings:{
              draw:{
                trail:1,
                showLayout:false
              }
    },

    update:function(_this){
      /* refresh rate of canvas (show trail) */
      //console.log(_this.ctx)
      if(this.settings.draw.trail==1) {
        _this.ctx.clearRect(0, 0, _this.ctx.canvas.clientWidth, _this.ctx.canvas.clientHeight);
      }else{
        debugDrawChart(0,
            0,
            ctx.canvas.clientWidth,
            ctx.canvas.clientHeight,
            "rgba(255,255,255,"+this.settings.draw.trail+")",
            ctx);
      }

      /* Draw body(s) from box2d */
      for( var b = _this.world.GetBodyList() ; b ; b = b.GetNext()) {
        for (var s = b.GetFixtureList(); s != null; s = s.GetNext()) {
          this.drawShape(_this,s);
        }
      }
    
      /* Show wireframe mode */
      if(this.settings.draw.showLayout==true){
        this.debugDrawChart(chart.position.x,
                chart.position.y,
                chart.position.width,
                chart.position.height,
                "rgba(255,0,0,0.2)",
                ctx);
      }
    },
    debugDrawChart :function (x,y,w,h,color,ctx) {
      ctx.save();  
      ctx.translate(0,0);  
      ctx.fillStyle = color;  
      ctx.beginPath();
      ctx.rect(x,y,w,h);      
      ctx.closePath();
      ctx.strokeStyle ="#000"
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();  
    },
    clippedBackgroundImage:function( ctx, img,x,y ){
      ctx.save(); 
      ctx.clip(); 
      //console.log(img)
      ctx.drawImage(img,
                    x-(img.height/2),
                    y-(img.width/2),
                    img.width,
                    img.height);
      ctx.restore(); 
    },
    haveTexture:function(s){
      var result = false
      if(typeof(s.m_userData.texture)!="undefined"){
        if(typeof(s.m_userData.texture.img)!="undefined"){
          if(s.m_userData.texture.img.complete){
            result = true
          }
        }
      }
      return result
    },
    
    drawShape: function (_this,s) {
    var b           = s.GetBody();
    var position    = b.GetPosition();
    var angle       = b.GetAngle();
    var radiusCoef  = 9;
    var radiusCoefMax=10
    var scale       = _this.settings.options.scale

    // add x and y to userData
    s.m_userData.x  = b.GetWorldCenter().x*scale
    s.m_userData.y  = b.GetWorldCenter().y*scale

    // Call back draw 
    if(typeof(s.m_userData.callback)!="undefined"){
        if(typeof(s.m_userData.callback.draw)=="function"){
               s.m_userData.callback.draw(s.m_userData)  
        }
    }

    switch (s.GetType()){
      case 0:  // round

        switch (s.m_userData){
          case null:
            _this.ctx.fillStyle = "rgba(255,0,0,1)";  
          break;
          default:
            _this.ctx.fillStyle = s.m_userData.fillStyle;  
          break
        }

        var radius = s.m_shape.m_radius

        // round token 
        if(_this.settings.sedimentation.token.visible==true){

          _this.ctx.save();  
          _this.ctx.translate(position.x*scale, position.y*scale);  
          _this.ctx.rotate(angle);  
          _this.ctx.beginPath();
          var h = (radius/radiusCoefMax*radiusCoef)*scale

          if(typeof(s.m_userData.fillStyle)!="undefined")   _this.ctx.fillStyle   = s.m_userData.fillStyle
          if(typeof(s.m_userData.strokeStyle)!="undefined"){ _this.ctx.strokeStyle = s.m_userData.strokeStyle
          } else{   _this.ctx.strokeStyle = s.m_userData.fillStyle}
          if(typeof(s.m_userData.lineWidth)!="undefined"){  _this.ctx.lineWidth   = s.m_userData.lineWidth 
          } else{   _this.ctx.lineWidth = 0}
          
          _this.ctx.arc(0, 0,h, 0, Math.PI*2, true); 

          if(this.haveTexture(s)){
              this.clippedBackgroundImage(_this.ctx,s.m_userData.texture.img
                                          ,0
                                          ,0);
          }
          _this.ctx.closePath();

          if(_this.settings.options.layout==true){
            _this.ctx.strokeStyle = "#000"
            _this.ctx.lineWidth   = 0.5
            _this.ctx.stroke();
          }else{
            if(!this.haveTexture(s))_this.ctx.fill();
             _this.ctx.stroke();

          }

          _this.ctx.restore();  

        }


      break
      case 1: // vertice (polygon and squares ...)



        switch (s.m_userData){
          case null:
            _this.ctx.fillStyle = "rgba(255,0,0,1)";  
          break;
          default:
            _this.ctx.fillStyle = s.m_userData.fillStyle;  
          break
        }

        var width = s.m_shape.m_vertices[0].x*scale
        var height = s.m_shape.m_vertices[0].y*scale
        var posx = position.x*scale-s.m_shape.m_vertices[0].x*scale
        var posy = position.y*scale-s.m_shape.m_vertices[0].y*scale
        
        _this.ctx.save();

        _this.ctx.translate(position.x*scale, position.y*scale); 
        _this.ctx.rotate(angle);
        _this.ctx.beginPath();
        for (var i = 0; i < s.m_shape.m_vertices.length; i++) {
          var points = s.m_shape.m_vertices;
          //var this = {x:0,y:0}
          _this.ctx.moveTo(( points[0].x) * scale, (points[0].y) * scale);
          for (var j = 1; j < points.length; j++) {
             _this.ctx.lineTo((points[j].x ) * scale, (points[j].y ) * scale);
          }
          _this.ctx.lineTo(( points[0].x) * scale, ( points[0].y) * scale);
        }
        _this.ctx.closePath();
        _this.ctx.fill(); 

        // pour le debug mode
        if(_this.settings.options.layout==true){
          _this.ctx.lineWidth   = 0.1;
          _this.ctx.strokeStyle ="rgb(0,0,0)"
          _this.ctx.stroke();
        }
        _this.ctx.restore();

      break;
      case 2:
  
      break;
      _this.ctx.fillStyle = "rgb(0,0,0)";  
    }

  }
}

})(jQuery);

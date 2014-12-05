var $c = function() {
  this.els = [];
};
var slice = Array.prototype.slice;

$c.fn = $c.prototype;

$c.fn.on = function( type, handle ) {
  this.els.forEach(function( el ) {
    if( el.addEventListener ){
      el.addEventListener (type,handle);
    } else {
      el.attachEvent('on'+type,function() {
        handle(window.event);
      });
    }
  });
}

var doc = new $c();
doc.els.push(document.body);

var trace_map = {
  mousedown_stamp : '',
  mousedown_time  : '',
  click_stamp     : '',
  click_time      : '',
  clicks          : []
};

function gen_classname ( el ) {
  if( el.className
   && typeof el.className == 'string' 
  ){
    return '.' + el.className.replace(/\s+/g,'.');
  }
  return gen_tag_name( el );
}
function gen_tag_name ( el ) {
  return el.nodeName.toLowerCase();
}
function gen_duplicate_slt ( el, gen_fun) {
  var slt = gen_fun(el);
  var siblings = el.parentNode.children;
  var count;
  var idx;
  var s_slt;
  for(var i=0,len = siblings.length,sibling;sibling=siblings[i];i++){
    if( sibling == el ){
      idx = i;
    } else {
      s_slt = gen_fun(sibling);
      if( s_slt == slt ){
        count = count? count+1:1;
      }
    }
  }
  if( count ){
    // nth-child
    slt += ':(' + (idx+1) +')';
  }
  return slt;
}

function css_path ( el, paths ) {
  var slt = el.id 
              ? '#'+el.id
              : gen_duplicate_slt( el, 
                  ( el.className 
                    && typeof el.className == 'string')
                      ? gen_classname
                      : gen_tag_name );

  slt += ( paths ? '>'+paths : '');

  if( el.nodeName.toLowerCase() != 'body' 
    && !el.id
  ){
    return css_path( el.parentNode, slt );
  } else {
    return slt;
  }
}

doc.on('click',function( e ){
  var pth = css_path(e.target);
  var time= Date.now();

  if( pth == trace_map.click_stamp 
    && time - trace_map.click_time < 100
  ){
    trace_map.click_stamp = undefined;
    trace_map.click_time = undefined;
  } else {
    trace_map.click_stamp = pth;
    trace_map.click_time = time;
    trace_map.clicks.push( pth +':'+time );
  }
});

doc.on('mousedown',function( e ){
  var pth = css_path(e.target);

  trace_map.mousedown_stamp = pth;
  trace_map.mousedown_time  = Date.now();
});

doc.on('mouseup',function( e ){
  var pth = css_path(e.target);
  var time= Date.now();

  if( pth == trace_map.mousedown_stamp 
    && time - trace_map.mousedown_time < 300
  ){
    trace_map.click_stamp = pth;
    trace_map.click_time  = time;

    trace_map.mousedown_stamp = undefined;
    trace_map.mousedown_time  = undefined;

    trace_map.clicks.push(pth +':'+ time);
  }
});
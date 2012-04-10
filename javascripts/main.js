$(window).ready(function(){
var j = jQuery
  , browser = '';

if( j.browser.msie ) browser = 'ms'
if( j.browser.mozilla ) browser = 'moz'
if( j.browser.opera ) browser = 'o'
if( j.browser.webkit ) browser = 'webkit'

function getDimension() {
    var jdoc = j(document)
        //w = jdoc.width(),
        //h = jdoc.height();
    //console.log('dimension', w, h);
    return {
        w: jdoc.width(),
        h: jdoc.height(),
    }
}

// dont use for panel anymore!


function positionElements(dim) {
    //var jdoc = j(document),
    //    w = jdoc.width(),
    //    h = jdoc.height(),
    var padding1 = 5,
        arrowBtW = 20;
    // ensure header size!
    j('body > header').css('height', dim.h * 0.18);
    //j('.screen:last').hide()
}

// all percentages, so never goes wrong
var spotPos = [[-28, -25], [0, -35], [28, -25], [35, 5], [28, 30], [0, 45], [-28, 30], [-35, 5]];
function rotateSpots(step, duration) {
    var pos = spotPos[ step % spotPos.length ];
    //console.log('spot..', pos, step, duration);
    j('.spot:first')
        .css('left', pos[0]+'%')
        .css('top', pos[1]+'%');
    pos = spotPos[ (step+4) % spotPos.length ];
    j('.spot:last')
        .css('left', pos[0]+'%')
        .css('top', pos[1]+'%');
    setTimeout(rotateSpots, duration, step + 1, duration);
}

function correctCSS (dim) {
    //var css = document.styleSheets[1]//$('style')[0].sheet.rules;
      //, perspective = Math.floor(90/0.060)+'px'
    var glasses = {
          base_val: [0.8581235697940504, 0.03489702517162471, 0.36041189931350115],
          right: {
              template: "perspective(?px) rotateY(-82deg) translate3d(?px,0px,-?px) !important;",
          },
          left: {
              template: "perspective(?px) rotateY(82deg) translate3d(-?px,0em,-?px) !important;",
          }
      }
    var diffW = dim.w - 1750
    glasses.base_val[0] = glasses.base_val[0]*( 1+(diffW*0.0006) )
    
    for (var i=0; i < glasses.base_val.length; i++) {
      glasses.right.template = glasses.right.template.replace( /\?/, glasses.base_val[i]*dim.w )
      glasses.left.template = glasses.left.template.replace( /\?/, glasses.base_val[i]*dim.w )
    };
    
    // TODO set font-size!
    
    var style = document.createElement('style');
    style.innerHTML = ".screen.right { -"+browser+"-transform: "+glasses.right.template+" } "+".screen.left  { -"+browser+"-transform: "+glasses.left.template+" }";
    j('head').append( style );
    
    
    
    // nao ta escrevendo no Chrome! pq?
    //css.insertRule( ".screen.right { -webkit-transform: "+glasses.right.template+" }", 0 )
    //css.insertRule( ".screen.left  { -webkit-transform: "+glasses.left.template+" }", 1 )
    
    console.log('dim', dim.w, dim.h);
}

function orderGlasses () {
  var glasses = j('.screen');
  glasses.filter(':eq(0)').addClass('middle')
  glasses.filter(':eq(1)').addClass('right')
  glasses.filter(':gt(1)').addClass('hidden').addClass('right')
  setTitle();
}

function setTitle () {
  j('#panel h1').text( j('.screen.middle h1').text() );
}

function bindArrowKeys(){
    var lastTap = new Date();
    j(document).keydown( function(e) {
        if( new Date() - lastTap > 100 ){
            
            if( e.which === 39 ){
                nextGlass();
                lastTap = new Date();
            }
            if( e.which === 37 ){
                prevGlass();
                lastTap = new Date();
            }
        }
        if( e.which == 37 || e.which === 39 ) return false;
    })
}

var oldNextShadow = null;
function nextGlass() {
    var glass = j('.screen.middle')
      , jarrow = j('#panel .next');
    
    jarrow.css('-webkit-transform', 'perspective(150px) rotateY(15deg)' );
    jarrow.css('box-shadow', 'black 2px 2px 4px' );
    setTimeout(function(){
        jarrow.css('-webkit-transform', 'perspective(150px) rotateY(0deg)' );
        jarrow.css('box-shadow', oldNextShadow );
    },200)
    
    if( glass.next().size() ){
        glass.removeClass('middle').addClass('left');
        glass.prev().addClass('hidden');//.removeClass('left')
        glass.next().addClass('middle').removeClass('right');
        glass.next().next().addClass('right').removeClass('hidden');
    }
    setTitle();
    return false;
}

var oldBackShadow = null;
function prevGlass() {
    var glass = j('.screen.middle')
      , jarrow = j('#panel .back');
    
    jarrow.css('-webkit-transform', 'perspective(150px) rotateY(-15deg)' );
    jarrow.css('box-shadow', 'black 2px 2px 4px' );
    setTimeout(function(){
        jarrow.css('-webkit-transform', 'perspective(150px) rotateY(0deg)' );
        jarrow.css('box-shadow', oldBackShadow );
    },200)
    
    j('#panel .back').css('-webkit-transform', 'perspective(150px) rotateY(-15deg)' )
    if( glass.prev().size() ){
        glass.removeClass('middle').addClass('right');
        glass.prev().addClass('middle').removeClass('left');
        glass.prev().prev().addClass('left').removeClass('hidden');
        glass.next().addClass('hidden');//.removeClass('right')
    }
    setTitle();
    return false;
}

// SPAM BE GONE
function printEmail () {
  var aaa = '@'
    , bbb = 'il.com';
  
  j('#econtact').text( ['fabiano', 'soriani', aaa, 'gma', bbb ].join('') )
}

function spinPortrait(){
    $('#portrait').rotate3Di('+=360', 20000, {easing:'linear', complete: spinPortrait });
}

function mySideChange(front) {
    if (front) {
        $(this).parent().find('.front').show();
        $(this).parent().find('.back').hide();
    } else {
        $(this).parent().find('.front').hide();
        $(this).parent().find('.back').show();
    }
}

function addEffectImgLinks () {
    $('.screen img').hover(
        function () {
            var jthis = j(this);
            jthis.css('box-shadow', "rgba(15, 102, 252, 0.7) 0 4px 5px, rgba(15, 102, 252, 0.7) 0 -4px 5px");
            //jthis.css('opacity', 0.5);
            //alert(1)
            //$(this).find('div').stop().rotate3Di('flip', 250, {direction: 'clockwise', sideChange: mySideChange});
        },
        function () {
            var jthis = j(this);
            jthis.css('box-shadow', '');
            //jthis.css('opacity', 1);
            //$(this).find('div').stop().rotate3Di('unflip', 500, {sideChange: mySideChange});
            //alert(2)
        }
    );
    j('a.popout').attr('target','_blank');
}

function init() {
    //setTimeout( function(){j("#welcome").fadeOut();}, 1000);
    var dim = getDimension();
    positionElements(dim);
    correctCSS(dim);
    j('#panel .next').click( nextGlass );
    j('#panel .back').click( prevGlass );
    
    rotateSpots(0, 1500);
    
    orderGlasses();
    bindArrowKeys();
    //setTimeout( function(){
    //    j('h1:first').addClass('h1distort');
    //}, 1000);
    printEmail();
    //spinPortrait();
    addEffectImgLinks();
    oldBackShadow = j('#panel .back').css('box-shadow');
    oldNextShadow = j('#panel .next').css('box-shadow');
}
init();


});
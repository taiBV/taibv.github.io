$(document).ready(function(){
    $(".btn-more").click(function(e){
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $("#section2").offset().top 
        }, 1000);
    })
    // 
    $(".btn-learn-free,.btn-regis").click(function(e){
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $(".main-time").offset().top 
        }, 1000);
        
    })
    // pop up 
    $(".popup-regis").hide();
    var w=$( document ).width(); // width of document
    $(document).scroll(function() {
        var y = $(this).scrollTop(); // height scroll top
        if(w > 992){
            if (y > 6800) {
                showPopup();
            } 
        }
        else{
            if (y > 7500) {
                showPopup();
            } 
        }
      });
     
      $(".icon-close").click(function(){
        $(".popup-regis").hide();
        $('body').css({'overflow':'unset'} );
        $('.content-tq').css({'opacity':'1'} );
        $(document).scroll(function() {
                    hidePopup();
          });
    });
    function showPopup(){
        $(".popup-regis").show();
        $('body').css({'overflow':'hidden'} );
        $('.content-tq').css({'opacity':'0.2'} );
    }
    function hidePopup(){
        $(".popup-regis").hide();
        $('body').css({'overflow':'unset'} );
        $('.content-tq').css({'opacity':'1'} );
    }
    // 
    //  coutdown 
    function getTimeRemaining(endtime) {
        var t = Date.parse(endtime) - Date.parse(moment());
        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
        var days = Math.floor(t / (1000 * 60 * 60 * 24));
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function initializeClock(id, endtime) {
    var clock = document.getElementById(id);
    function updateClock() {
        var t = getTimeRemaining(endtime);
        if(t.days < 10)
        if(t.hours < 10)
        {
            $(".h-1").html('0');
            $(".h-2").html(('' + t.hours).slice(0,1));
        }  
        else
        {
            $(".h-1").html(('' + t.hours).slice(0,1));
            $(".h-2").html(('' + t.hours).slice(1,2));
        }
        if(t.minutes < 10)
        {
            $(".m-1").html('0');
            $(".m-2").html(('' + t.minutes).slice(0,1));
        } 
        else
        {
            $(".m-1").html(('' + t.minutes).slice(0,1));
            $(".m-2").html( ('' + t.minutes).slice(1,2));
        }
        if(t.seconds < 10)
        {
            $(".s-1").html('0');
            $(".s-2").html(('' + t.seconds).slice(0,1));
        } 
        else
        {
            $(".s-1").html(('' + t.seconds).slice(0,1)) ;
            $(".s-2").html(('' + t.seconds).slice(1,2)) ;
        }
        if (t.total <= 0) {
            deadline=moment().add(5,'hour')
            initializeClock('clock', deadline);
        clearInterval(timeinterval);
        }
    }
        updateClock();
        var timeinterval = setInterval(updateClock, 1000);
    }
    var deadline = moment().add(5,'hour');
    initializeClock('clock', deadline);
   
})

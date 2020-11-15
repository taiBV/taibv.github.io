$( function() {
    lazyload();
    $( "#datepicker" ).datepicker({
        dateFormat: 'dd-mm-yy',
    });
    $( "#datepicker" ).datepicker().datepicker("setDate", new Date());
    $(".hambuger").click(function () {
        $(".sub_menu_mobi").toggle("slide");
    })
    $(".icon-close").click(function () {
        $(".sub_menu_mobi").toggle("slide");
    })
} );
function showDetail(){
    $(".info_detail_search").slideToggle( "slow" );
};
function submitChangePostionLive(){
    
}
$('.carousel').carousel({
    interval: false,
});
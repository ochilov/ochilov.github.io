$(function() {
	$('.toggleblock').hide();
	$('.toggleheader').click(function() {
		$(this).slideToggle('slow');
		$(this).next('.toggleblock').slideToggle('slow');	
	});

	$('.togglefooter').click(function() {
		$(this).prev().slideToggle('slow');	
	});
});
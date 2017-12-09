// Getting the URL from the website
var firstURL = window.location.origin;

// Saving to first id to local storage
localStorage.setItem('first', $('#next').attr('data-id'));

// Then listen for the next button
$(document).on('click','#next', function() {
	// Get id from button
	var id = $(this).attr('data-id');
	
	// Getting the  next article
	$.get(firstURL + "/next/" + id, buttons);
});

// Then listen for the previous button
$(document).on('click','#prev', function() {
	// Then get the id from button
	var id = $(this).attr('data-id');
	// Getting the  next article
	$.get(firstURL + "/prev/" + id, buttons);
});

function buttons(res) {
	// Updating the  content
	$('#picture>img').attr('src', res[0].imgURL);
	$('#content>h2').text(res[0].title);
	$('#content>p').text(res[0].synopsis);
	$('a.articleURL').attr('href', res[0].articleURL);
	
	// Updating comments
	comments(res[0].comments);
	// This is to check if the previous button exists
	$buttons = $('#buttons');
	if ($buttons.children().length === 1) {
		// then add a button
		var $but = $('<button>').text('Previous').attr('id','prev').attr('data-id',res[0]._id);
		$buttons.prepend($but);
	} else {
		// This is to check if the new id is the first id
		if (res[0]._id === localStorage.getItem('first')) {
			// If true then  remove it
			$('#prev').remove();
		} else {
			// Or  update the prev button id
			$('#prev').attr('data-id',res[0]._id);
		}		
	}
	// This is for Updating the next and post button id
	$('#next').attr('data-id',res[0]._id);
	$('#post').attr('data-id',res[0]._id);
}

function comments(obj) {
	$('#comment-holder').remove();
	var $commentHolder = $('<div>').attr('id','comment-holder');
	for (var i=0; i<obj.length; i++) {
		var $p = $('<p>').html('<span class="number">' + (i+1) + '</span> ' + obj[i].text + ' <a href="#" class="remove" data-id="' + obj[i]._id + '">X</a>');
		$commentHolder.append($p);
	}
	$('#curs>div.comments').append($commentHolder);
}

// Listening for the  post button
$(document).on('click','#post', function() {
	
	// Geting  id from button
	var id = $(this).attr('data-id');
	// Getting  the comment
	$comment = $("#comment");
	var comment = $comment.val().trim();
	// Clearing the comment
	$comment.val('');
	// This is for getting the next article
	$.post(firstURL + "/comment/" + id, {comment: comment}, function(res) {
		// This is to update comments
		comments(res);
	});
});

// This is to listen for the remove click
$(document).on('click','.remove', function() {
	// This is to get id from post button
	var id = $('#post').attr('data-id');
	// This is to get remove id
	var removeID = $(this).attr('data-id');
	// This is to get next article
	$.post(firstURL + "/remove/" + id, {id: removeID}, function(res) {
		// This is to update comments
		comments(res);
	});
	return false;
});
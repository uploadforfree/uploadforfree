document.addEventListener('DOMContentLoaded', () => {
	const searchBar = document.getElementById('search-bar');
	const searchButton = document.getElementById('search-button');
	const suggestions = document.getElementById('suggestions');
	const resultContainer = document.getElementById('result');
	const errorMessage = document.getElementById('error-message');

	let followers = [];

	// Fetch the JSON file and sort followers by timestamp
	fetch('followers_1.json')
    	.then(response => {
        	if (!response.ok) {
            	throw new Error('Network response was not ok');
        	}
        	return response.json();
    	})
    	.then(data => {
        	followers = data.map(item => item.string_list_data[0]);
        	followers.sort((a, b) => a.timestamp - b.timestamp);
    	})
    	.catch(error => {
        	console.error('There was a problem with the fetch operation:', error);
        	showError('Unable to load follower data. Please try again later.');
    	});

	searchBar.addEventListener('input', () => {
    	const query = searchBar.value.trim().toLowerCase().replace(/^@/, '');
    	suggestions.innerHTML = '';
    
    	if (query.length > 0) {
        	const matchingFollowers = followers.filter(follower =>
            	follower.value.toLowerCase().startsWith(query)
        	);

        	matchingFollowers.forEach(follower => {
            	const li = document.createElement('li');
            	li.textContent = follower.value;
            	li.addEventListener('click', () => {
                	searchBar.value = follower.value;
                	suggestions.innerHTML = ''; // Clear suggestions after selecting
                	search();
            	});
            	suggestions.appendChild(li);
        	});
    	}
	});

	searchButton.addEventListener('click', search);

	function search() {
    	const username = searchBar.value.trim().toLowerCase().replace(/^@/, '');
    	const userIndex = followers.findIndex(follower => follower.value.toLowerCase() === username);

    	if (userIndex !== -1) {
        	const followerNumber = userIndex + 1;
        	const timestamp = followers[userIndex].timestamp;
        	const followDate = new Date(timestamp * 1000);
        	const accountCreation = new Date('2023-10-10T20:55:00Z'); // Keep as UTC
        	const timeDiff = followDate - accountCreation;

        	const diffSeconds = Math.floor(timeDiff / 1000);
        	const days = Math.floor(diffSeconds / (24 * 3600));
        	const hours = Math.floor((diffSeconds % (24 * 3600)) / 3600);
        	const minutes = Math.floor((diffSeconds % 3600) / 60);
        	const seconds = diffSeconds % 60;

        	const timeDiffString = [
            	days ? `${days} days` : null,
            	hours ? `${hours} hours` : null,
            	minutes ? `${minutes} minutes` : null,
            	`${seconds} seconds`
        	].filter(Boolean).join(', ');

        	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        	const localFollowTime = followDate.toLocaleString('en-US', { timeZone, hour12: true, month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

        	resultContainer.innerHTML = `
            	<p><strong>@${followers[userIndex].value}</strong> is the ${followerNumber}${getOrdinalSuffix(followerNumber)} follower of @uploadforfree</p>
            	<p>They followed on ${localFollowTime} ${timeZone}.</p>
            	<p>This was exactly ${timeDiffString} after UFF was created.</p>
        	`;
        	resultContainer.style.display = 'block';
        	errorMessage.style.opacity = 0;
    	} else {
        	showError('That username is not found in our system. Maybe you were not following upload for free when this data was recorded. Check back later!');
    	}
	}

	function getOrdinalSuffix(i) {
    	const j = i % 10, k = i % 100;
    	if (j === 1 && k !== 11) {
        	return "st";
    	}
    	if (j === 2 && k !== 12) {
        	return "nd";
    	}
    	if (j === 3 && k !== 13) {
        	return "rd";
    	}
    	return "th";
	}

	function showError(message) {
    	errorMessage.textContent = message;
    	errorMessage.style.opacity = 1;
    	setTimeout(() => {
        	errorMessage.style.opacity = 0;
    	}, 15000);
	}
});

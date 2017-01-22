angular.module('cardboard').service('cardboardService', ['localStorageService', function (localStorageService) {
	
	/* 
		Initialisation: 
	*/
	this.cardboard = localStorageService.get('cardboard') || {};
	this.cards = this.cardboard.cards || [];
	this.decks = this.cardboard.decks || [];
	
	// private:
	this.save = function() {
		localStorageService.set("cardboard", this.cardboard);
	}
	
	// public:
	function findById(col, id) {
		return _.find(col, function(c) { return c.id === id; });
	}
	
	function findMaxId(col) {
		return _.isEmpty(col) ? 0 : _.max(col, function(c) { return c.id; }).id;
	}
	
	function findIndexById(col, id) {
		return _.findIndex(col, function(c) { return c.id === id; });
	}
	
	/*
		Decks:
	*/
	
	/* Reserved decks: */
	
	var reservedDecks = [
	{
		id: -1,	// +ve ids are generated by users.
		name: "Default",
		description: "The default deck for your cards, dog."
	}];
	
	// Ensure all reserved decks are stored.
	_.each(reservedDecks, function(r) {
		// If you can't find this reserved deck, add it in.
		if (!_.find(this.decks, function(d) { return r.id === d.id; }))
			this.decks.push(r);
	}, this);
	
	function isDeckReserved(id) {
		return _.find(reservedDecks, function(d) { return d.id === id; });
	}
	
	this.defaultDeck = findById(reservedDecks, -1);
	
	// args = { id, name, description }
	this.updateDeck = function(args) {
		if (isDeckReserved(args.id))
			return alert("Nope, you can't modify reserved decks, pup.");
		
		var d = findById(this.decks, args.id);
		if (d)
		{
			d.name = args.name || d.name;
			d.description = args.description || d.description;
		}
		
		this.save();
	}
	
	// args = { name, description }
	this.addDeck = function(args) {
		var newId = findMaxId(this.decks) + 1;
		this.decks.push({
			id: newId,
			name: args.name,
			description: args.description
		});
		
		this.save();
		return newId;
	}
	
	this.deleteDeck = function(id) {
		if (isDeckReserved(id))
			return alert("Nope, you can't modify reserved decks, pup.");
		
		// Delete all referenced cards.
		var cards = this.getCardsInDeck(id);
		_.each(cards, function(c) { this.deleteCard(c.id); }, this);
		
		var idx = findIndexById(this.decks, id);
		if (idx >= 0) this.decks.splice(idx, 1);
		this.save();
	}
	
	this.getCardsInDeck = function(id) {
		return _.filter(this.cards, function(c) { return c.deck_id === id; });
	}
	
	/*
		Cards:
	*/
	
	// args = { id, left, top, title, content }
	this.updateCard = function(args) {
		var c = findById(this.cards, args.id);
		if (c)
		{
			c.left = args.left || c.left;
			c.top = args.top || c.top;
			c.title = args.title || c.title;
			c.content = args.content || c.content;
			c.deck_id = args.deck_id || c.deck_id;
		}
		
		this.save();
	}
	
	// args = { left, top, title, content }
	this.addCard = function(args) {
		var newId = findMaxId(this.cards) + 1;
		
		this.cards.push({
			id: newId,
			top: args.top,
			left: args.left,
			title: args.title,
			content: args.content,
			deck_id: args.deck_id
		});
		
		this.save();
		return newId;
	}
	
	this.deleteCard = function(id) {
		var idx = findIndexById(this.cards, id);
		if (idx >= 0) this.cards.splice(idx, 1);
		this.save();
	}
}]);

/*
	Cardboard schema:
	
	cardboard = 
	{
		decks:
		[
			{
				id: 1,
				name: "test deck",
				description: "test deck description"
			},
			{
				id: 2,
				name: "test deck2",
				description: "test deck description2"
			},
		],
		cards:
		[
			{
				id: 1,
				deck_id: null,
				left: 10,
				top: 10,
				title: "card1",
				content: "card1-content"
			},
			{
				id: 2,
				deck_id: 2,
				left: 50,
				top: 10,
				title: "card2",
				content: "card2-content"
			},
			{
				id: 3,
				deck_id: 1,
				left: 40,
				top: 30,
				title: "card3",
				content: "card3-content"
			}
		];
	}
*/

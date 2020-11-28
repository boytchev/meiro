
//	Основи на Компютърната Графика
//	Модел 28272 - Мека сянка с текстура
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M28272 = function M28272(room)
{
	MEIRO.Model.apply(this, arguments);

	var floor = new MEIRO.Cube(1);
	floor.scale.set(20,0.1,20);
	floor.material = new THREE.MeshBasicMaterial({color:'burlywood'});

	var soft = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAk1BMVEUAAACbRA6aTiObSB+fTimeTySgUCufUSugUCugTSqgUi2hUi2gUSufUiugUi2gUi2gUi2gUi2hUS2fTymhUi2gUi2gUiygUS2gUi2gUi2hUi2hUiygUi2gUi2gUi2gUi2hUi2gUi2gUS2gUi2gUi2hUi2fUSygUi2gUi2hUS2hUi2hUi2gUS2hUiyhUy2gUi2eUiz1+gJUAAAAMXRSTlMABAsIFQ8dJyIS/EcxLffwz448GYBTQTfmrHJl6+DWuHpsYJqlWk30vofIw5/bspRX80GVwAAAAtxJREFUWMOtlwGzklAQhSm1Hq+s1NSMUkEhUcD7/39dZ3cPQgxjzWxn3jx98+b77u5eFG40yBvLxPJWwz/4r+hZSIMn20UMdDzj8dOuPJvNYgZv20qeGLrqCU97oeRJH1yeuMCr1btHViuR9BVjfB8H/IK818g7SP5UjKxPPjYa4Hw+/4jgRSzqiMcNXN/wKXDAYLfbpWa7hQUSKKamoGG4Ppd/AS3wZrP5oMEbSOCAYjVi4PrkUTzwJdiiWK/XIeBXUcCyhAKNjBg6XpYnXqxDnmdZliT4ledhXVAhRQwNA17xHGiapt8RvECTq2JgGOGxvOFgj8evmuMRFlOgiIGB/AT9G4/lg+CAy3KhKUtIRBFQhBniGXezFcj8yGN5wQHfT6cKOZ3ukIgCRdAgk6SADcj8yScpcNDV+bzTnM8VHFCkCQ2yF2yiLUD4ufBZguUV3zXNQdM0O1WgiCQTw1wMbQnA2QDmj/XBlwvFD5fLTXO5HFSxKGFADdgLNgEFBToAzJ+84rfr9Yvmer2pggbshY6BgnYHpIEiJKnxwEHvGTigMEOahEKaaHcisgmwgQzzM17wuv6pqWtRmAGTzNiETgGCrgBp4MHvQX9j4Ng/DGiiKwEVTLgFLKC8V+SB/2CgoKG6lyyBGzGJOMJeAY3xwD8zUJih6ZXAMUZ6EaGDXgE340H+0ohCDbdeCehBL6ZIRmAdhK4A5YF/0kChhq6EoD3oEKJ2BNYBCzAeLGMGlmA92BAo4Aikg64A4V81YuhKkB44BApiE+gItIN9zQJeGZZQ77UHHYIJYgj6M8QI2g7I9wxtDxhCf4oU6FWAGVZ/F1SYol4JQ0FI/l2QhP8m8LfgHqJzG70Xkv9S9n+Y3B9n/xeK+yvN+aXq/lr331i8tzb/zdV/e3c/YHgfcdwPWe7HPP+Dpv9R1/+wTYPjcd9/4KDCceTxH7qo8Bz7/AdPKhxHX8fh23X8/w0SzfdXE+ocoAAAAABJRU5ErkJggg==');
	soft.wrapS = THREE.RepeatWrapping;
	soft.wrapT = THREE.RepeatWrapping;
	soft.anisotropy = 8;
	
	this.n = 8;
	this.ball = [];
	for (var i=0; i<this.n; i++)
	{
		this.ball.push( new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.SPHERE,MEIRO.PRIMITIVE.STYLE.PAWN) );
		this.ball[i].offset = 2*Math.PI*Math.random();
	}
	
	var geometry = new THREE.CircleGeometry(1,options.lowpoly?16:32);
	this.shadow = [];
	for (var i=0; i<this.n; i++)
	{
		this.shadow.push( new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:soft,transparent:true,depthWrite:false})) );
		this.shadow[i].rotation.x = -Math.PI/2;
		this.shadow[i].scale.set(1.5,1.5,1.5);
	}
	
	// сглобяване на целия модел
	this.image.add(floor);
	for (var i=0; i<this.n; i++)
	{
		this.image.add(this.ball[i]);
		this.image.add(this.shadow[i]);
	}
}

MEIRO.Models.M28272.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M28272.DIST = {MIN:10, MAX:40, HEIGHT:-3};
MEIRO.Models.M28272.POS = {DIST:20, ROT_X:0, ROT_Y:0.3};
MEIRO.Models.M28272.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M28272.prototype.onAnimate = function(time)
{
	for (var i=0; i<this.n; i++)
	{
		var a = 2*Math.PI*i/this.n;
		var b = this.ball[i];
		b.position.set(
			8*Math.sin(rpm(time,12)+a),
			1+8*Math.abs(Math.sin(rpm(time,20)+b.offset)),
			8*Math.cos(rpm(time,12)+a)
		);
		this.shadow[i].position.set(
			b.position.x,
			0.1,
			b.position.z
		);
		this.shadow[i].material.opacity = 1-b.position.y/10;
	}
	reanimate();
}



// информатор на модела
MEIRO.Models.M28272.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Мека сянка с текстура</h1>';

	s += '<p>Мекотата на сянката се проличава в контура ѝ &ndash; той не е рязък, а се стопява плавно. В този пример това е реализирано чрез текстура с плавно увеличаваща се прозрачност.</p>';
	element.innerHTML = s;
}
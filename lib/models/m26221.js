
//	Основи на Компютърната Графика
//	Модел 26221 - Огъване на кубче от слоеве
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M26221 = function M26221(room)
{
	MEIRO.Model.apply(this, arguments);
	
	var geometry = new THREE.BoxGeometry(2.19,0.25,2.19);
	geometry.translate(0,0.125,-0.723);
	var material = new THREE.MeshPhongMaterial({color:'cornflowerblue',shininess:20});
	
	this.block = new THREE.Mesh(geometry,material);
	for (var b=this.block,n=0; n<11; n++)
	{
		var newB = new THREE.Mesh(geometry,material);
		newB.position.y = 0.25;
		b.add( newB );
		b = newB;
	}

	// бутон за превключване
	this.k = 0;
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'Огъване', 'images/toggle.png');
	this.toggle.hide();
	
	
	// сглобяване на целия модел
	this.image.add(this.block);
}

MEIRO.Models.M26221.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M26221.DIST = {MIN:5, MAX:20, HEIGHT:-2};
MEIRO.Models.M26221.POS = {DIST:10, ROT_X:0.3, ROT_Y:0.3};
MEIRO.Models.M26221.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M26221.prototype.onAnimate = function(time)
{
	var s = 1*(1-this.k) + this.k*Math.pow(324/219,1/11);
	for (var b=this.block.children[0]; b; b=b.children[0])
	{
		b.position.y = 0.25+0.025*this.k;
		b.rotation.x = Math.PI/180 * 33/11 * this.k;
		b.scale.set(1,1,s);
	}

	TWEEN.update();
	if (this.k>0 && this.k<1) reanimate();
}



// информатор на модела
MEIRO.Models.M26221.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Огъване на кубче от слоеве</h1>';

	s += '<p>Кубична форма е представена чрез 12 еднакви слоя. При огъване на формата всеки от слоевете става малко по-голям от предходния. Освен това той се и завърта леко.</p>';
	
	element.innerHTML = s;
}




// превключвател на модела
MEIRO.Models.M26221.prototype.onToggle = function(element)
{
	this.toggle.setText(this.k<0.5?'Изправяне':'Огъване');

	var that = this;
	new TWEEN.Tween({k:that.k})
		.to({k:that.k<0.5?1:0},500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.k=this.k} )
		.start();

	reanimate();
}
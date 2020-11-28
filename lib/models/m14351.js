
//	Основи на Компютърната Графика
//	Модел 14351 - Костенуркова графика - къща
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M14351 = function M14351(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// костенурка
	this.turtle = new MEIRO.Turtle(0.5);
	
	// време
	this.i = -2;
	this.cnt = 0;
	this.style = new THREE.LineBasicMaterial({color:'black'});
	this.commands = [
		'fd',2.5,
		'rt',90,
		'fd',0.75,
		'lt',135,
		'fd',4/Math.sqrt(2),
		'lt',90,
		'fd',4/Math.sqrt(2),
		'lt',135,
		'fd',0.75,
		'rt',90,
		'fd',2.5,
		'lt',90,
		'fd',2.5,
		'lt',90];
	this.active = false;
	this.draw = true;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.turtle);
}

MEIRO.Models.M14351.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M14351.DIST = {MIN:5, MAX:20, HEIGHT:-1};
MEIRO.Models.M14351.POS = {DIST:10, ROT_X:0.9, ROT_Y:0.5};
MEIRO.Models.M14351.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M14351.prototype.onAnimate = function(time)
{	
	if (!this.active)
		return;
		
	if (this.cnt==0)
	{
		this.i += 2;
		if (this.i>=this.commands.length)
		{
			this.draw = false;
			this.active = false;
			return;
		}
			
		this.cmd = this.commands[this.i];
		this.total = this.commands[this.i+1];
		switch (this.cmd)
		{
			case 'lt':
			case 'rt': this.cnt = (this.total/4)|0; break;
			case 'fd': this.cnt = (20*this.total)|0; break;
		}
		this.step = this.total/this.cnt;
		
		if (this.draw && this.cmd=='fd')
		{
			this.line = new MEIRO.Line(this.turtle.getPosition(),this.turtle.getPosition());
			this.line.material = this.style;
			this.image.add(this.line);
		}
	}

	switch (this.cmd)
	{
		case 'fd':
			this.turtle.fd(this.step);
			if (this.draw)
			{
				this.line.setTo(this.turtle.getPosition());
				this.line.geometry.computeBoundingSphere()
			}
			break;
		case 'lt':
			this.turtle.lt(this.step);
			break;
		case 'rt':
			this.turtle.rt(this.step);
			break;
	}
	
	this.cnt--;
	reanimate();
}



// информатор на модела
MEIRO.Models.M14351.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Костенуркова графика &ndash; къща</h1>';

	s += '<p>При костенуркова графика създаването на геометрични форми става чрез командване на виртуална костенурка. Командите са от типа "върви напред", "завий наляво", "завий надясно".</p>';

	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M14351.prototype.onToggle = function(element)
{
	this.i = -2;
	this.cnt = 0;
	this.active = true;
	this.turtle.basis = new MEIRO.Basis();
	reanimate();
}

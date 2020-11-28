
//	Основи на Компютърната Графика
//	Модел 14352 - Костенуркова графика - петокъщие
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M14352 = function M14352(room, model)
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
		'rt',180-360/5];
	this.commands = [].concat(this.commands,this.commands,this.commands,this.commands,this.commands);
	
	this.active = false;
	this.draw = true;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.turtle);
}

MEIRO.Models.M14352.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M14352.DIST = {MIN:5, MAX:20, HEIGHT:-1};
MEIRO.Models.M14352.POS = {DIST:10, ROT_X:0.9, ROT_Y:0.5};
MEIRO.Models.M14352.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M14352.prototype.onAnimate = function(time)
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
			case 'rt': this.cnt = (this.total/5)|0; break;
			case 'fd': this.cnt = (8*this.total)|0; break;
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
MEIRO.Models.M14352.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Костенуркова графика &ndash; петокъщие</h1>';

	s += '<p>Основно свойство на костенуркова графика е относителността на движението. Когато костенурката се движи и създава обект, този обект приема началното положение и ориентация на костенурката. В конкретния модел командите за петте къщи са идентични, въпреки че координатите на върховете им са напълно различни.</p>';

	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M14352.prototype.onToggle = function(element)
{
	this.i = -2;
	this.cnt = 0;
	this.active = true;
	this.turtle.basis = new MEIRO.Basis();
	reanimate();
}

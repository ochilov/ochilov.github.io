var MyForm = {};

MyForm.container = document.getElementById('myForm');

MyForm.submit = function(Owner) {
	var checkData = this.validate();
	if (checkData.isValid) {
		this.doSubmit();
	}
};

MyForm.validate = function() {
	var isValid = true; 
	var errorFields=[];
	for (var i = 0, count = this.container.elements.length; i < count; i++) {
		var item = this.container.elements[i];
		var item_valid = true;
		switch (item.name) {
			case 'fio'  : item_valid = this.checkFIO  (item.value); break;
			case 'email': item_valid = this.checkEmail(item.value); break;
			case 'phone': item_valid = this.checkPhone(item.value); break;
		}

		if (item_valid) {
			item.classList.remove('error');
		}
		else {
			item.classList.add('error');
			isValid = false;
			errorFields.push(item.name);	
		}
	}	
	return {isValid, errorFields};
};

MyForm.getData = function() {
	var data={};
	for (var i = 0, count = this.container.elements.length; i < count; i++) {
		var item = this.container.elements[i];
		if (item.name !== '') {
			data[item.name] = item.value;	
		}
	}
	return data; 
};

MyForm.setData = function(data) {
	for (var name in data) {
		if (name !== 'phone' && name !== 'fio' && name !== 'email')
			continue;
		var elem = this.getElementByName(name);
		if (elem != null) {
			elem.value = data[name]; 
		}
	}
};

MyForm.getElementByName = function(name) {
	for (var i = 0, count = this.container.elements.length; i < count; i++) {
		var item = this.container.elements[i]; 
		if (item.name === name) {
			return item;
		}
	}
	return null;
};

MyForm.submitUrls = ['success.json', 'error.json', 'progress.json'];
MyForm.submitUrlIndex = 0;
MyForm.doSubmit = function() {
	var needEnableBtn = true;
	if (this.submitUrlIndex > 2)
		this.submitUrlIndex = 0;
	var url = this.submitUrls[this.submitUrlIndex++];
	$.ajax({
		url: url,
		crossDomain: true,
		type: 'GET',
		dataType : "json",
		beforeSend:function() {
			var btn = document.getElementById('submitButton');
			if (btn !== null) {
				btn.disabled = true;
			}
		},
		success: function (data, textStatus) {
			var resultContainer = document.getElementById('resultContainer');
			resultContainer.classList.remove('error');
			resultContainer.classList.remove('success');
			while (resultContainer.firstChild)
				resultContainer.removeChild(resultContainer.firstChild);

			switch (data.status) {
				case 'success': {
					var content = '<p>'+'Success'+'</p>';
					resultContainer.innerHTML = content;
					resultContainer.classList.add('success');
					break;
				}
				case 'error':{
					var content = '<p>'+data.reason+'</p>';
					resultContainer.innerHTML = content;
					resultContainer.classList.add('error');
					break;
				}
				case 'progress':{
					needEnableBtn = false;
					if (data.timeout > 0) {
						console.log('call MyForm.doSubmit() after ' + data.timeout + 'ms');
						setTimeout(MyForm.doSubmit.bind(MyForm), data.timeout);
					}
					break;
				}  
			}
		},
		error: function (jqXHR, exception) {
			console.log('ajax.error: ' + exception +'; jqXHR.status: ' + jqXHR.status);
		},
		complete: function () {
			if (needEnableBtn) {
				var btn = document.getElementById('submitButton');
				if (btn !== null) {
					btn.disabled = false;
				}	
			}
		}

	});
};

MyForm.checkFIO = function(data) {
	var res = data.split(" ");
	var words_count = 0;
	for (var i = 0, count = res.length; i < count; i++) {
		if (res[i] !== '')
			words_count++;
	}
	return words_count === 3;
};
MyForm.checkEmail = function(data) {
	/*https://regex101.com*/
	var valid = false;
	var regMask = '([^]+)@([^]+)';
	var res = data.match(regMask);
	if (res != null && res.length == 3) {
		var inDomen = res[2];
		var validDomens = ['ya.ru', 'yandex.ru', 'yandex.ua', 'yandex.by', 'yandex.kz', 'yandex.com'];
		for (var i = 0, count = validDomens.length; i < count; i++) {
			if (inDomen == validDomens[i]) {
				valid = true;
				break;
			}
		}
	}
	return valid;

};
MyForm.checkPhone = function(data) {
	var valid = false;
	var regMask = '(\\+7)\\(([0-9]{3})\\)([0-9]{3})-([0-9]{2})-([0-9]{2})';
	var res = data.match(regMask);
	if (res != null) {
		var numbersSum = 7; // +7...
		for (var i = 2, count = res.length; i < count; i++) {
			var item = res[i];
			for (var j = 0, jcount = item.length; j < jcount; j++) {
				var num = parseInt(item[j]);
				numbersSum += num;
			} 
		}
		valid = numbersSum <= 30; 
	}
	return valid;
};
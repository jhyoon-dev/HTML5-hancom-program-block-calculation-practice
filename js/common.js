var con_w = 1000; // 콘텐츠의 기준 가로 사이즈 (scale 조절에 쓰임)
var con_h = 660; // 콘텐츠의 기준 세로 사이즈 (scale 조절에 쓰임)
var con_scale = 1; // 콘텐츠의 scale

var mouse_x;
var mouse_y;
var eventObj;
var $startObj;
var $endObj;
var isDragging = false;
var table_info = [10,4]; // 표의 행, 열
var cell_w = 180; // 셀의 넓이
var cell_h = 30; // 셀의 높이
var $cells;
var $doCalc;

$(document).ready(function(){
	$(window).resize(function(){
		response();
	});
	$(window).resize();

	loadSuccess();
});

function loadSuccess(){
	$doCalc = $('.doCalc');
	$cells = $('.cell');

	for(var i = 1; i <= table_info[0]; i++){ //행
		for(var j = 1; j <= table_info[1]; j++){ //열
			var n = (table_info[1]*(i-1))+j - 1;
			// 행 열 클래스 이름 붙여줌
			$cells.eq(n).addClass('row' + i);
			$cells.eq(n).addClass('col' + j);

			// 모든셀 정렬함
			if( n > 0 ){
				$cells.eq(n).css({
					'top' : px_to_num($cells.eq(0).css('top')) + cell_h * (i-1) - ((i-1)*1),
					'left' : px_to_num($cells.eq(0).css('left')) + cell_w * (j-1) - ((j-1)*1)
				});
			}

			$('.cell.row' + i + '.col' + j).on('touchstart', function(e){
				$startObj = $(this);
				event_start(e);
			});
			$('.cell.row' + i + '.col' + j).on('mousedown', function(e){
				$startObj = $(this);
				event_start(e);
			});
		}
	}

	document.getElementById('content').addEventListener('mousemove', event_move, false);
	document.getElementById('content').addEventListener('mouseup', event_end, false);
	document.getElementById('content').addEventListener('touchmove', event_move, false);
	document.getElementById('content').addEventListener('touchend', event_end, false);

	$('.depth1 > li').click(function(){
		if( !$(this).hasClass('correct') ){
			call_alert('블록 계산식을 선택하세요.');
		}else{
			$(this).addClass('on');
		}
	});

	$('.calc').click(function(){
		var select_cell = $('.cell.select').length;
		var result = 0;
		if( $(this).hasClass('mul') ){result = 1;}
		for(var i = 0; i < select_cell; i++){
			var $cell = $('.cell.select').eq(i);
			if( !$cell.hasClass('correct') ){
				call_alert('지출 금액만 선택 후 계산하세요.');
				reset_quiz();
				return;
			}

			if( $(this).hasClass('sum') ){
				if( !$cell.hasClass('total') ){
					var tmp = $cell.html().replace(',', '');
					result += Number(tmp);
				}
			}else if( $(this).hasClass('avg') ){
				if( !$cell.hasClass('total') ){
					var tmp = $cell.html().replace(',', '');
					result += Number(tmp);
				}
			}else if( $(this).hasClass('mul') ){
				if( !$cell.hasClass('total') ){
					var tmp = $cell.html().replace(',', '');
					if( Number(tmp) == 0){continue;}
					result *= Number(tmp);
				}
			}

			if( $cell.hasClass('total') ){
				if( $(this).hasClass('avg') ){
					result = result / (select_cell-1);
				}
				$('.cell.total.correct').html( numberFormat(result) );
				$doCalc.hide();
				$('.quiz_submit').fadeIn(200);
				return;
			}
		}
		call_alert('합계 행까지 선택 후 계산하세요.');
		reset_quiz();
	})

	$('.quiz_submit').click(function(){
		call_alert('제출하였습니다.');
	});

}

// 창 사이즈 조절 시 실행
function response(){
	var win_w = $(window).width();
	var win_h = $(window).height();
	if(win_w < con_w){
		con_scale = win_w/con_w;
	}else{
		con_scale = 1;
	}
	$('#content_wrap').css('transform', 'scale(' + con_scale + ')');
}

function setEventObj(e){
	if(e.changedTouches){ // 모바일 터치일 때
		eventObj = e.changedTouches[0];
	}else{ // PC 클릭일 때
		eventObj = e;
	}
}

function event_start(e){ // 클릭 시작
	$doCalc.hide();
	$doCalc.find('.correct').removeClass('on');
	$cells.removeClass('select');
	$startObj.addClass('select').addClass('start');
	setEventObj(e);
	isDragging = true;
}

function event_move(e){ // 클릭 시작 후 움직임
	setEventObj(e);
	mouse_x = eventObj.pageX - ($(window).width() - $('#content').width())/2;
	mouse_y = eventObj.pageY - ($(window).height() - $('#content').height())/2;

	if(isDragging){
		active_end();
		cell_filling();
	}
}

function event_end(){ // 클릭 끝
	$cells.removeClass('start').removeClass('end');
	if(isDragging){
		isDragging = false;
		active_end();
		cell_filling();
		$doCalc.css({
			'left' : px_to_num( $endObj.css('left') ) - 50
		}).fadeIn(200);
	}
}

function active_end(){
	for(var i = 0; i < $cells.length; i++){
		var $cell = $cells.eq(i);
		var $cell_x = px_to_num( $cell.css('left') ) * con_scale;
		var $cell_y = px_to_num( $cell.css('top') ) * con_scale;

		if(mouse_x >= $cell_x && mouse_x <= ($cell_x + cell_w) && mouse_y >= $cell_y && mouse_y <= ($cell_y + cell_h) ){
			$cells.removeClass('end');
			$cell.addClass('end');
			$endObj = $cell;
		}
	}
}

function cell_filling(){
	var start_pos = [];
	var end_pos = [];
	var tmp;
	var start_tmp = $startObj.attr('class');
	var start_row = Number(start_tmp.slice( start_tmp.indexOf('row'), start_tmp.indexOf(' ', start_tmp.indexOf('row'))).replace('row',''));
	var start_col = Number(start_tmp.slice( start_tmp.indexOf('col'), start_tmp.indexOf(' ', start_tmp.indexOf('col'))).replace('col',''));
	var end_tmp = $endObj.attr('class');
	var end_row = Number(end_tmp.slice( end_tmp.indexOf('row'), end_tmp.indexOf(' ', end_tmp.indexOf('row'))).replace('row',''));
	var end_col = Number(end_tmp.slice( end_tmp.indexOf('col'), end_tmp.indexOf(' ', end_tmp.indexOf('col'))).replace('col',''));

	if(start_row > end_row){
		tmp = start_row;
		start_row = end_row;
		end_row = tmp;
	}
	if(start_col > end_col){
		tmp = start_col;
		start_col = end_col;
		end_col = tmp;
	}
	$cells.removeClass('select');
	for(var i = start_row; i <= end_row; i++){ //행
		for(var j = start_col; j <= end_col; j++){ //열
			$('.cell.col' + j + '.row' + i).addClass('select');
		}
	}

}

function numberFormat(number) {
	var string = number.toString();
	var length = string.length;
	var standard = (length % 3 === 0) ? 3 : length % 3;
	var arr = [];

	var start = 0;

	while (true) {
		var temp = string.substr(start, standard);
		if (temp === "") break;
		arr.push(temp);
		start = start + standard;
		standard = 3;
	}

	var result = arr.join(",");
	return result;
}

function reset_quiz(){
	$cells.removeClass('select');
	$doCalc.hide();
	$doCalc.find('.correct').removeClass('on');
	$('.cell.total.correct').html("")
}

function call_alert(str){
	console.log(str);
	$('#content').append('<div id="alert_wrap"></div>');
	$('#alert_wrap').append('<div id="alert_msg" class="alert_content"><p>' + str + '</p></div>');
	$('#alert_wrap').fadeIn(200);
	setTimeout(function(){
		$('#alert_wrap').fadeOut(200, function(){
			$('#alert_wrap').detach();
		});
	}, 1000);
}

// px 문자열 삽입
function num_to_px(num){
	return num + 'px';
}

// % 문자열 삽입
function num_to_percent(num){
	return num + '%';
}

// px 삭제하고 숫자로 변환
function px_to_num(px){
	return Number(px.toString().replace('px',''));
}

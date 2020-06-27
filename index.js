$(function () {
    var username = getUrlParameter("username");
    var course = getUrlParameter("course");
    if (username === undefined || course === undefined) {
        alert("Thiếu tham số!");
        return;
    }

    var bar = new ProgressBar.Circle("#count-time", {
        trailWidth: 13,
        trailColor: "white",
        duration: 40000,
        text: {
            autoStyleContainer: false
        },
        from: {color: 'rgba(0, 141, 150, 1)', width: 13},
        to: {color: 'rgba(0, 141, 150, 1)', width: 13},
        // Set default step function for all animate calls
        step: function (state, circle) {
            circle.path.setAttribute('stroke', state.color);
            circle.path.setAttribute('stroke-width', state.width);
            circle.path.setAttribute('stroke-linecap', 'round');
            var value = 40 - Math.round(circle.value() * 40);
            if (value === 0) {
                circle.setText('0s');
            } else {
                circle.setText(Math.ceil(value) + "s");
            }
        }
    });
    bar.text.style.fontFamily = '"Cabin", sans-serif';
    bar.text.style.fontSize = '20px';
    bar.text.style.color = 'white';

    $.ajax({
        method: "POST",
        url: "https://attt.edupia.vn/service/giasu/getQuestion",
        headers: {
            username: username,
            course: course,
            isbegin: 0,
            forcepass: 0
        }
    }).done(function (payload) {
        if (payload.end != undefined) {
            $('.welcome-title').hide();
            $('.question-title').hide();
            $('.end-title').show();
            $('#intro').hide();
            $('#end-game').show();
            var total = 0;
            payload.resultLogs.forEach(function (result) {
                total += result.score;
                $('#end-game .row').append(`<div class="col-md-4 col-6 pl-0 pr-3"><div class="result-item">Câu ${result.index}<span class="float-right">${result.score} điểm</div></span></div>`);
            });
            $('.end-game-point').text(total);
            bar.destroy();
        } else if (payload.start == undefined) {
            $('#intro').hide();
            appendData(payload.question, payload.index, 15, payload.answerLogOfCurrent);
            bar.stop();
            setupBar(payload.seconds);
        }
    });

    $('.begin-test').click(function () {
        $.ajax({
            method: "POST",
            url: "https://attt.edupia.vn/service/giasu/getQuestion",
            headers: {
                username: username,
                course: course,
                isbegin: 1,
                forcepass: 0
            }
        }).done(function (payload) {
            $('#intro').hide();
            appendData(payload.question, payload.index, 15);
            bar.stop();
            setupBar(payload.seconds);
        });
    });

    function setupBar(seconds) {
        $('#count-time').show();
        if (seconds > 40) {
            bar.set(1);
        } else {
            bar.set((40 - seconds) / 40);
            bar.animate(1, {duration: seconds * 1000}, function () {
                $.ajax({
                    method: "POST",
                    url: "https://attt.edupia.vn/service/giasu/getQuestion",
                    headers: {
                        username: username,
                        course: course,
                        isbegin: 0,
                        forcepass: 1
                    }
                }).done(function (payload) {
                    if (payload.end != undefined) {
                        $('.welcome-title').hide();
                        $('.question-title').hide();
                        $('.end-title').show();
                        $('#intro').hide();
                        $('#end-game').show();
                        var total = 0;
                        payload.resultLogs.forEach(function (result) {
                            total += result.score;
                            $('#end-game .row').append(`<div class="col-md-4 col-6 pl-0 pr-3"><div class="result-item">Câu ${result.index}<span class="float-right">${result.score} điểm</div></span></div>`);
                        });
                        $('.end-game-point').text(total);
                        bar.destroy();
                    } else {
                        $('#intro').hide();
                        appendData(payload.question, payload.index, 15);
                        bar.stop();
                        setupBar(payload.seconds);
                    }
                });
            });
        }
    }

    function appendData(question, currentIndex, numberOfQuestions, answerLogOfCurrent) {
        function doSubmit(answer) {
            $.ajax({
                method: "POST",
                url: "https://attt.edupia.vn/service/giasu/sendAnswer",
                data: {
                    username: username,
                    course: course,
                    index: currentIndex,
                    answer: JSON.stringify(answer)
                }
            }).done(function (payload) {
                if (payload.resultCode == 1) {
                    $("#game-submit").text("ĐÃ NỘP BÀI");
                    $("#game-submit").off('click');
                    $("#game-submit").css("background-color", "rgb(150, 143, 143)");
                    $.ajax({
                        method: "POST",
                        url: "https://attt.edupia.vn/service/giasu/getQuestion",
                        headers: {
                            username: username,
                            course: course,
                            isbegin: 0,
                            forcepass: 1
                        }
                    }).done(function (payload) {
                        if (payload.end != undefined) {
                            $('.welcome-title').hide();
                            $('.question-title').hide();
                            $('.end-title').show();
                            $('#play-game').hide();
                            $('#intro').hide();
                            $('#end-game').show();
                            var total = 0;
                            payload.resultLogs.forEach(function (result) {
                                total += result.score;
                                $('#end-game .row').append(`<div class="col-md-4 col-6 pl-0 pr-3 "><div class="result-item">Câu ${result.index}<span class="float-right">${result.score} điểm</div></span></div>`);
                            });
                            $('.end-game-point').text(total);
                            bar.destroy();
                        } else {
                            appendData(payload.question, payload.index, 15);
                            bar.stop();
                            setupBar(payload.seconds);
                        }
                    });
                } else {
                    alert(payload.message);
                }
            });
        }

        $('.question-title').css('display', 'flex');
        $('.welcome-title').hide();
        $('.game-main-header .index-question').text(`${currentIndex}/${numberOfQuestions}:`);
        $('.game-main-header .content-question').text(question.title);
        switch (question.type) {
            case 1:
                var answers = [];
                for (let i = 0; i < question.answer.length; i++) {
                    var indexAnswer = question.answer[i].value.slice(0, 2);
                    answers.push(`<label id="label-${indexAnswer.slice(0, 1)}" for=${question.answer[i].name}>
                    <input type="radio" id=${question.answer[i].name} name="answer" value="${question.answer[i].value}" style="display:none" />
                    <div class="answer" id="answer${indexAnswer.slice(0, 1)}">
                        <p class="content">${question.answer[i].value}</p>
                    </div>
                    </label>`);
                }
                answers.push('<div id="game-submit">NỘP BÀI</div>');
                var answersElement = answers.reduce(function (str, button) {
                    return str + button;
                }, "");
                var textquestion = question.question[0].value.replace("\n", "<br/>");
                $('#play-game').html(`<div id="game1" class="game-main-body">
                                        <p id="textquestion">${textquestion}</p>
                                        ${answersElement}
                                    </div>`);
                if (answerLogOfCurrent) {
                    $(`input[type='radio'][value='${answerLogOfCurrent.answer}']`).attr("checked", true);
                    $("input[type=radio]").attr('disabled', true);
                    $("#game1 #game-submit").text("ĐÃ NỘP BÀI");
                    $("#game1 #game-submit").off('click');
                    $("#game1 #game-submit").css("background-color", "rgb(150, 143, 143)");

                }
                else {
                    $('#game1 #game-submit').click(function () {
                        var answer = $("input[name='answer']:checked").val();
                        if (answer == undefined) {
                            alert("Vui lòng chọn đáp án");
                        }
                        else {
                            doSubmit(answer);
                            $("input[type=radio]").attr('disabled', true);
                        }
                    });
                }
                break;
            case 2:
                var topButtons = [];
                var bottomButtons = [];
                // var link = question.question[0].voice;
                // if (link) {
                //     link = link.replace("/uploads", "https://static.edupia.vn");
                // }
                if (answerLogOfCurrent) {
                    for (let i = 0; i < answerLogOfCurrent.answer.length; i++) {
                        topButtons.push(`<button class="question" id="question${i + 1}"></button>`);
                        bottomButtons.push(`<button class="answer" id="answer${i + 1}">${answerLogOfCurrent.answer[i]}</button>`);
                    }
                }
                else {
                    for (let i = 0; i < question.question.length; i++) {
                        topButtons.push(`<button class="question" id="question${i + 1}">${question.question[i].value}</button>`);
                        bottomButtons.push(`<button class="answer" id="answer${i + 1}"></button>`);
                    }
                }
                var topElement = topButtons.reduce(function (str, button) {
                    return str + button;
                }, "");
                var bottomElement = bottomButtons.reduce(function (str, button) {
                    return str + button;
                }, "");

                $('#play-game').html(`<div id="game2" class="game-main-body">
                                        <div class="questions">${topElement}</div>
                                        <img src="/images/game_tttt/blue-arrow-down-icon-png-11.png" id="arrowdown">
                                        <div class="answers">${bottomElement}</div>
                                        <p id="right-answer"></p>
                                        <div id="game-submit">NỘP BÀI</div>
                                    </div>`);
                var count = question.question.length;
                $('#audio-wrap').click(function () {
                    $('#audio_game2')[0].play();
                });
                if (answerLogOfCurrent) {
                    $("#game2 #game-submit").text("ĐÃ NỘP BÀI");
                    $("#game2 #game-submit").off('click');
                    $("#game2 #game-submit").css("background-color", "rgb(150, 143, 143)");
                }
                else {
                    $('#game2 .questions .question').click(function (event) {
                        var x = event.target;
                        if (x.textContent) {
                            for (let i = 1; i <= count; i++) {
                                var selector = "#answer" + i;
                                if (!$(selector).text()) {
                                    $(selector).text(x.textContent);
                                    $(selector).attr("question", x.id);
                                    x.innerText = "";
                                }
                            }
                        }
                    });
                    $('#game2 .answers .answer').click(function (event) {
                        var x = event.target;
                        var selector = "#" + x.getAttribute("question");
                        if (selector && x.textContent) {
                            $(selector).text(x.textContent);
                            x.innerText = "";
                        }
                    });
                    $('#game2 #game-submit').click(function () {
                        var answer = [];
                        for (let i = 1; i <= count; i++) {
                            var selector = "#answer" + i;
                            if (!$(selector).text()) {
                                answer = [];
                                break;
                            }
                            answer.push($(selector).text());
                        }
                        if (answer.length === 0) {
                            alert("Bạn chưa sắp xếp xong");
                        }
                        else {
                            doSubmit(answer);
                            $('#game2 .answers .answer').off('click');
                        }
                    });
                }
                break;
            case 3:
                var str = "_____";
                var arr = question.question[0].value.split(str);
                var link = question.question[0].images;
                link = link.replace("/uploads", "https://static.edupia.vn");
                $('#play-game').html(`<div id="game3" class="game-main-body">
                                        <img src=${link}>
                                        <div id="sentence">
                                            <label for="answerInput" style="width: 100%;">
                                                <p id="fillSentence"><span style="
                                                margin-right: 3px;
                                            ">${arr[0]}</span><input type="input" id="answerInput"><span style="
                                                position: absolute;
                                                bottom: -3px;
                                            ">${str}</span><span style="
                                            margin-left: 49px;
                                        ">${arr[1]}</span></p>
                                            </label>
                                        </div>
                                        <p id="right-answer"></p>
                                        <div id="game-submit">Nộp bài</div>
                                    </div>`);
                if (answerLogOfCurrent) {
                    $('#answerInput').attr("value", answerLogOfCurrent.answer);
                    $("input[type='input']").attr('disabled', true);
                    $("#game3 #game-submit").text("ĐÃ NỘP BÀI");
                    $("#game3 #game-submit").off('click');
                    $("#game3 #game-submit").css("background-color", "rgb(150, 143, 143)");
                }
                else {
                    $('#game3 #game-submit').click(function () {
                        var answer = $("#answerInput").val();
                        if (answer === undefined || answer === "") {
                            alert("Vui lòng điền đáp án");
                        }
                        else {
                            doSubmit(answer);
                            $("input[type='input']").attr('disabled', true);
                        }
                    });
                }
                break;
            case 4:
                var topButtons = [];
                var bottomButtons = [];
                var checkVoice = false;
                for (let i = 0; i < question.question.length; i++) {
                    var link = question.answer[i].images ? question.answer[i].images : question.answer[i].voice;
                    if (link) {
                        link = link.replace("/uploads", "https://static.edupia.vn");
                    }
                    if (question.answer[i].voice) {
                        checkVoice = true;
                        topButtons.push(`<button class="top-button" id="${i + 1}">
                                            <audio src="${link}" id="audio${i + 1}" class="audio_game4"></audio>
                                            <img src="/images/game_tttt/icon/icon_volume.svg">
                                            <p>Click to listen</p>
                                        </button>`);
                    }
                    else if (question.answer[i].images) {
                        topButtons.push(`<button class="top-button" id="${i + 1}" style="background-image: url(${link})"></button>`);
                    }

                    bottomButtons.push(`<button class="bottom-button">${question.question[i].value}</button>`);
                }
                var topElement = topButtons.reduce(function (str, button) {
                    return str + button;
                }, "");
                var bottomElement = bottomButtons.reduce(function (str, button) {
                    return str + button;
                }, "");
                $('#play-game').html(`<div id="game4" class="game-main-body">
                                            <div class="top">${topElement}</div>
                                            <div id="canvas-match"></div>
                                            <div class="bottom">${bottomElement}</div>
                                            <div id="game-submit">NỘP BÀI</div>
                                    </div>`);
                for (let i = 1; i <= 3; i++) {
                    $(`.playaudio${i}`).click(function () {
                        $(`#audio${i}`)[0].play();
                    });
                }
                init();
                if (answerLogOfCurrent) {
                    var topButtons = document.querySelectorAll('.top-button');
                    topButtons.forEach(function (element, index) {
                        element.classList.add('clicked');
                        var bottomButton = $('.bottom-button').filter(function () {
                            return $(this).text().toLowerCase().indexOf(answerLogOfCurrent.answer[index].toLowerCase()) >= 0;
                        }).toArray()[0];
                        let x1, y1, x2, y2;
                        x1 = element.offsetLeft + element.getBoundingClientRect().width / 2;
                        y1 = element.offsetTop + element.getBoundingClientRect().height;
                        x2 = bottomButton.offsetLeft + bottomButton.getBoundingClientRect().width / 2;
                        y2 = bottomButton.offsetTop;
                        bottomButton.classList.add('clicked');
                        let newLine = {
                            coordinates: {
                                x1: x1,
                                y1: y1,
                                x2: x2,
                                y2: y2
                            },
                            correct: null
                        };
                        lines[index] = newLine;
                        answersType4[index].value = answerLogOfCurrent.answer[index];
                        c = document.getElementById("myCanvas");
                        (x = c.offsetLeft), (y = c.offsetTop);
                        ctx = c.getContext("2d");
                        ctx.clearRect(0, 0, c.width, c.height);
                        drawLines(ctx, x, y);
                    });
                    $("#game4 #game-submit").text("ĐÃ NỘP BÀI");
                    $("#game4 #game-submit").off('click');
                    $("#game4 #game-submit").css("background-color", "rgb(150, 143, 143)");
                }
                else {
                    $('#game4 button').click(function (event) {
                        let currBtn;
                        if (event.target.nodeName === "BUTTON") {
                            currBtn = event.target;
                        }
                        else {
                            currBtn = event.target.parentNode;
                        }
                        let parentNode = currBtn.parentNode;
                        if (parentNode.classList.toString().includes("top") === true) {
                            currIndex = $(".top button").index(currBtn);
                            stopAllAudio();
                            if (checkVoice) { $(`#audio${currIndex + 1}`)[0].play(); }
                            currBtn.classList.remove("clicked");
                            answersType4[currIndex].value = null;
                            lines[currIndex] = null;
                            $(".bottom button").each(function (index, element) {
                                if (answersType4.findIndex(answer => answer.value === element.textContent) === -1) {
                                    element.classList.remove("clicked");
                                }
                            });
                            c = document.getElementById("myCanvas");
                            (x = c.offsetLeft), (y = c.offsetTop);
                            ctx = c.getContext("2d");
                            ctx.clearRect(0, 0, c.width, c.height);
                            drawLines(ctx, x, y);
                        }
                        if (parentNode.classList.toString().includes("bottom") === true) {
                            if (answersType4.findIndex(answer => answer.value === currBtn.textContent) > -1) {
                                $(".top button")[currIndex].focus();
                                return;
                            } else {
                                $(".top button")[currIndex].focus();
                            }
                            let x1, y1, x2, y2;
                            let indexElement = $(".top button")[currIndex];
                            indexElement.classList.add("clicked");
                            x1 = indexElement.offsetLeft + indexElement.getBoundingClientRect().width / 2;
                            y1 = indexElement.offsetTop + indexElement.getBoundingClientRect().height;
                            x2 = currBtn.offsetLeft + currBtn.getBoundingClientRect().width / 2;
                            y2 = currBtn.offsetTop;
                            let newLine = {
                                coordinates: {
                                    x1: x1,
                                    y1: y1,
                                    x2: x2,
                                    y2: y2
                                },
                                correct: null
                            };
                            answersType4[currIndex].value = currBtn.textContent;
                            lines[currIndex] = newLine;
                            $(".bottom button").each(function (index, element) {
                                if (answersType4.findIndex(answer => answer.value === element.textContent) > -1) {
                                    element.classList.add("clicked");
                                } else {
                                    element.classList.remove("clicked");
                                }
                                ctx.clearRect(0, 0, c.width, c.height);
                                drawLines(ctx, x, y);
                            });
                        }
                    });
                    var allAudios = document.querySelectorAll('.audio_game4');
                    function stopAllAudio() {
                        allAudios.forEach(function (audio) {
                            audio.pause();
                            audio.currentTime = 0;
                        });
                    }
                    $("#game4 #game-submit").on('click', function () {
                        var answersSubmit = [];
                        for (let i = 0; i < answersType4.length; i++) {
                            if (!answersType4[i].value) {
                                answersSubmit = [];
                                break;
                            }
                            else {
                                answersSubmit.push(answersType4[i].value);
                            }
                        }
                        if (answersSubmit.length === 0) {
                            alert("Bạn chưa hoàn thành câu hỏi");
                        }
                        else {
                            doSubmit(answersSubmit);
                            $("#game4 button").attr('disabled', true);
                        }
                    });
                }
            function init() {
                answersType4 = new Array(3);
                $(".top button").each(function (index, element) {
                    answersType4[index] = {
                        id: parseInt(element.id),
                        value: null,
                        correct: null
                    };
                });
                lines = new Array(3);
                lines.fill(null);
                var WIDTH = $(".top")[0].getBoundingClientRect().width;
                const canvas = `<canvas height=31px width=${WIDTH}  id='myCanvas'></canvas >`;
                $("#canvas-match")[0].innerHTML = canvas;
            }
            function drawLines(ctx, x, y) {
                lines.forEach(function (line) {
                    if (line !== null) {
                        ctx.beginPath();
                        ctx.moveTo(line.coordinates.x1 - x, line.coordinates.y1 - y);
                        ctx.lineTo(line.coordinates.x2 - x, line.coordinates.y2 - y);
                        ctx.strokeStyle =
                            line.correct != null
                                ? line.correct
                                ? "#49c08f"
                                : "#f0686f"
                                : "rgba(63, 194, 202, 1)";
                        ctx.stroke();
                    }
                });
            }
                break;
            case 5:
                var linkImage = question.question[0].images;
                if (linkImage) {
                    linkImage = linkImage.replace("/uploads", "https://static.edupia.vn");
                }
                var linkAudio = question.question[0].voice;
                if (linkAudio) {
                    linkAudio = linkAudio.replace("/uploads", "https://static.edupia.vn");
                }
                var mediaElement = "";
                if (linkAudio) {
                    mediaElement = `<audio src="${linkAudio}" id="audio_game5"></audio>
                    <button id="audio-wrap">
                        <img src="/images/game_tttt/icon/icon_volume.svg">
                        <p>Click to listen</p>
                    </button>`;
                }
                else {
                    mediaElement = `<img src="${linkImage}">`
                }
                $('#play-game').html(`<div id="game5" class="game-main-body">
                                        ${mediaElement}
                                        <div class="answer-wrapper">
                                            <p>${question.question[0].value}</p>
                                            <div>
                                                <label class="answer-label" for="answer-true">
                                                    <input type="radio" name="answer" id="answer-true" value="${question.answer[0].value}">
                                                    <div class="label" id="label-true">${question.answer[0].value.slice(3).toUpperCase()}</div>
                                                </label>
                                                <label class="answer-label" for="answer-false">
                                                    <input type="radio" name="answer" id="answer-false" value="${question.answer[1].value}">
                                                    <div class="label" id="label-false">${question.answer[1].value.slice(3).toUpperCase()}</div>
                                                </label>
                                            </div>
                                        </div>
                                        <div id="game-submit">Nộp bài</div>
                                    </div>`);
                $('#audio-wrap').click(function () {
                    $('#audio_game5')[0].play();
                })
                if (answerLogOfCurrent) {
                    $("input[type=radio]").attr('disabled', true);
                    if (answerLogOfCurrent.answer == question.answer[0].value) {
                        $(`input[type='radio'][value='${question.answer[0].value}']`).attr("checked", true);
                    }
                    else if (answerLogOfCurrent.answer == question.answer[1].value) {
                        $(`input[type='radio'][value='${question.answer[1].value}']`).attr("checked", true);
                    }
                    $("#game5 #game-submit").text("ĐÃ NỘP BÀI");
                    $("#game5 #game-submit").off('click');
                    $("#game5 #game-submit").css("background-color", "rgb(150, 143, 143)");
                }
                else {
                    $('#game5 #game-submit').click(function () {
                        var answer = $("input[name='answer']:checked").val();
                        if (answer == undefined) {
                            alert("Vui lòng chọn đáp án.");
                        }
                        else {
                            $("input[type=radio]").attr('disabled', true);
                            doSubmit(answer);
                        }
                    });
                }
                break;
            case 6:
                var str = "_____";
                var linkAudio = question.question[0].voice;
                if (linkAudio) {
                    linkAudio = linkAudio.replace("/uploads", "https://static.edupia.vn");
                }
                var arr = question.question[0].value.split(str);
                $('#play-game').html(`<div id="game6" class="game-main-body">
                                        <audio src="${linkAudio}" id="audio_game6"></audio>
                                        <button id="audio-wrap">
                                            <img src="/images/game_tttt/icon/icon_volume.svg">
                                            <p>Click to listen</p>
                                        </button>
                                        <div id="sentence">
                                            <label for="answerInput" style="width: 100%;">
                                                <p id="fillSentence"><span style="
                                                margin-right: 3px;
                                            ">${arr[0]}</span><input type="input" id="answerInput"><span style="
                                                position: absolute;
                                                bottom: -3px;
                                            ">${str}</span><span style="
                                            margin-left: 49px;
                                        ">${arr[1]}</span></p>
                                            </label>
                                        </div>
                                        <p id="right-answer"></p>
                                        <div id="game-submit">NỘP BÀI</div>
                                    </div>`);
                $('#audio-wrap').click(function () {
                    $('#audio_game6')[0].play();
                });
                if (answerLogOfCurrent) {
                    $('#answerInput').attr("value", answerLogOfCurrent.answer);
                    $("input[type='input']").attr('disabled', true);
                    $("#game6 #game-submit").text("ĐÃ NỘP BÀI");
                    $("#game6 #game-submit").off('click');
                    $("#game6 #game-submit").css("background-color", "rgb(150, 143, 143)");
                }
                else {
                    $('#game6 #game-submit').click(function () {
                        var answer = $("#answerInput").val();
                        if (answer === undefined || answer === "") {
                            alert("Vui lòng điền đáp án");
                        }
                        else {
                            $("input[type='input']").attr('disabled', true);
                            doSubmit(answer);
                        }
                    });
                }
                break;
            case 7:
                var leftButtons = [];
                var rightButtons = [];
                var link = question.question[0].voice;
                if (link) {
                    link = link.replace("/uploads", "https://static.edupia.vn");
                }
                if (answerLogOfCurrent) {
                    for (let i = 0; i < answerLogOfCurrent.answer.length; i++) {
                        leftButtons.push(`<button id="stt${i + 1}">${i + 1}</button>`);
                        rightButtons.push(`<div class="box box${i + 1} list-group-item">${answerLogOfCurrent.answer[i]}</div>`);
                    }
                }
                else {
                    for (let i = 1; i < question.question.length; i++) {
                        leftButtons.push(`<button id="stt${i}">${i}</button>`);
                        rightButtons.push(`<div class="box box${i} list-group-item">${question.question[i].value}</div>`);
                    }
                }
                var leftElement = leftButtons.reduce(function (str, button) {
                    return str + button;
                }, "");
                var rightElement = rightButtons.reduce(function (str, button) {
                    return str + button;
                }, "");
                $('#play-game').html(`<div id="game7">
                                        <div class="game-main-body">
                                            <div class="audio-wrap">
                                                <audio id="AudioGame7">
                                                    <source src="${link}"  type="audio/mp3">
                                                    Your browser does not support the audio element.
                                                </audio>
                                                <button class="play-audio">
                                                    <img class="audio-icon" src="/images/game_tttt/icon/icon_volume.svg">
                                                    <span class="audio-label">Click to listen</span>
                                                </button>
                                            </div>
                                            <div class="content">
                                                <div class="left">${leftElement}</div>
                                                <div id="list">${rightElement}</div>
                                            </div>
                                            <div id="game-submit">NỘP BÀI</div>
                                        </div>
                                    </div>`);
                $(".play-audio").click(function () {
                    $('#AudioGame7')[0].play();
                });
                if (answerLogOfCurrent) {
                    $("#game7 #game-submit").text("ĐÃ NỘP BÀI");
                    $("#game7 #game-submit").off('click');
                    $("#game7 #game-submit").css("background-color", "rgb(150, 143, 143)");
                }
                else {
                    Sortable.create(list, {
                        swap: true,
                        swapClass: "highlight",
                        animation: 150
                    });
                    $("#game7 #game-submit").click(function () {
                        var arr = [];
                        var e = document.querySelectorAll('.box');
                        for (let i = 0; i < e.length; i++) {
                            arr.push(e[i].innerText);
                        }
                        doSubmit(arr);
                    });
                }
                break;
            case 8:
                var topButtons = [];
                var bottomButtons = [];
                var linkAudio = question.question[0].voice;
                if (linkAudio) {
                    linkAudio = linkAudio.replace("/uploads", "https://static.edupia.vn");
                }
                for (let i = 1; i < question.question.length; i++) {
                    topButtons.push(`<button class="top-button" id="${i}">${question.answer[i - 1].value}</button>`);
                    bottomButtons.push(`<button class="bottom-button">${question.question[i].value}</button>`);
                }
                var topElement = topButtons.reduce(function (str, button) {
                    return str + button;
                }, "");
                var bottomElement = bottomButtons.reduce(function (str, button) {
                    return str + button;
                }, "");
                $('#play-game').html(`<div id="game8" class="game-main-body">
                                        <button id="audio-wrap" style="
                                        margin-top: 5px;
                                    ">
                                            <audio src="${linkAudio}" id="audio_game8"></audio>
                                            <img src="/images/game_tttt/icon/icon_volume.svg">
                                            <p>Click to listen</p>
                                        </button>
                                        <div class="top">${topElement}</div>
                                        <div id="canvas-match"></div>
                                        <div class="bottom">${bottomElement}</div>
                                        <div id="game-submit">NỘP BÀI</div>
                                    </div>`);
                $('#audio-wrap').click(function () {
                    $('#audio_game8')[0].play();
                });
                init();
                if (answerLogOfCurrent) {
                    var topButtons = document.querySelectorAll('.top-button');
                    topButtons.forEach(function (element, index) {
                        element.classList.add('clicked');
                        var bottomButton = $('.bottom-button').filter(function () {
                            return $(this).text().toLowerCase().indexOf(answerLogOfCurrent.answer[index].toLowerCase()) >= 0;
                        }).toArray()[0];
                        let x1, y1, x2, y2;
                        x1 = element.offsetLeft + element.getBoundingClientRect().width / 2;
                        y1 = element.offsetTop + element.getBoundingClientRect().height;
                        x2 = bottomButton.offsetLeft + bottomButton.getBoundingClientRect().width / 2;
                        y2 = bottomButton.offsetTop;
                        bottomButton.classList.add('clicked');
                        let newLine = {
                            coordinates: {
                                x1: x1,
                                y1: y1,
                                x2: x2,
                                y2: y2
                            },
                            correct: null
                        };
                        lines[index] = newLine;
                        answersType4[index].value = answerLogOfCurrent.answer[index];
                        c = document.getElementById("myCanvas");
                        (x = c.offsetLeft), (y = c.offsetTop);
                        ctx = c.getContext("2d");
                        ctx.clearRect(0, 0, c.width, c.height);
                        drawLines(ctx, x, y);
                    });
                    $("#game8 #game-submit").text("ĐÃ NỘP BÀI");
                    $("#game8 #game-submit").off('click');
                    $("#game8 #game-submit").css("background-color", "rgb(150, 143, 143)");
                }
                else {
                    $('#game8 button').click(function (event) {
                        let currBtn;
                        if (event.target.nodeName === "BUTTON") {
                            currBtn = event.target;
                        }
                        else {
                            currBtn = event.target.parentNode;
                        }
                        let parentNode = currBtn.parentNode;
                        if (parentNode.classList.toString().includes("top") === true) {
                            currIndex = $(".top button").index(currBtn);
                            currBtn.classList.remove("clicked");
                            answersType4[currIndex].value = null;
                            lines[currIndex] = null;
                            $(".bottom button").each(function (index, element) {
                                if (answersType4.findIndex(answer => answer.value === element.textContent) === -1) {
                                    element.classList.remove("clicked");
                                }
                            });
                            c = document.getElementById("myCanvas");
                            (x = c.offsetLeft), (y = c.offsetTop);
                            ctx = c.getContext("2d");
                            ctx.clearRect(0, 0, c.width, c.height);
                            drawLines(ctx, x, y);
                        }
                        if (parentNode.classList.toString().includes("bottom") === true) {
                            if (answersType4.findIndex(answer => answer.value === currBtn.textContent) > -1) {
                                $(".top button")[currIndex].focus();
                                return;
                            } else {
                                $(".top button")[currIndex].focus();
                            }
                            let x1, y1, x2, y2;
                            let indexElement = $(".top button")[currIndex];
                            indexElement.classList.add("clicked");
                            x1 = indexElement.offsetLeft + indexElement.getBoundingClientRect().width / 2;
                            y1 = indexElement.offsetTop + indexElement.getBoundingClientRect().height;
                            x2 = currBtn.offsetLeft + currBtn.getBoundingClientRect().width / 2;
                            y2 = currBtn.offsetTop;
                            let newLine = {
                                coordinates: {
                                    x1: x1,
                                    y1: y1,
                                    x2: x2,
                                    y2: y2
                                },
                                correct: null
                            };
                            answersType4[currIndex].value = currBtn.textContent;
                            lines[currIndex] = newLine;
                            $(".bottom button").each(function (index, element) {
                                if (answersType4.findIndex(answer => answer.value === element.textContent) > -1) {
                                    element.classList.add("clicked");
                                } else {
                                    element.classList.remove("clicked");
                                }
                                ctx.clearRect(0, 0, c.width, c.height);
                                drawLines(ctx, x, y);
                            });
                        }
                    });
                    $("#game8 #game-submit").on('click', function () {
                        var answersSubmit = [];
                        for (let i = 0; i < answersType4.length; i++) {
                            if (!answersType4[i].value) {
                                answersSubmit = [];
                                break;
                            }
                            else {
                                answersSubmit.push(answersType4[i].value);
                            }
                        }
                        if (answersSubmit.length === 0) {
                            alert("Bạn chưa hoàn thành câu hỏi");
                        }
                        else {
                            doSubmit(answersSubmit);
                            $("#game8 button").attr('disabled', true);
                        }
                    });
                }
                break;
            case 9:
                var answers = [];
                for (let i = 0; i < question.answer.length; i++) {
                    var indexAnswer = question.answer[i].value.slice(0, 2);
                    answers.push(`<label id="label-${indexAnswer.slice(0, 1)}" for=${question.answer[i].name}>
                    <input type="radio" id=${question.answer[i].name} name="answer" value="${question.answer[i].value}" style="display:none" />
                    <div class="answer" id="answer${indexAnswer.slice(0, 1)}">
                        <p class="content">${question.answer[i].value}</p>
                    </div>
                    </label>`);
                }
                answers.push('<div id="game-submit">NỘP BÀI</div>');
                var answersElement = answers.reduce(function (str, button) {
                    return str + button;
                }, "");
                $('#play-game').html(`<div id="game9" class="game-main-body">
                                        <p id="textquestion">${question.question[0].value}</p>
                                        ${answersElement}
                                    </div>`);
                if (answerLogOfCurrent) {
                    $(`input[type='radio'][value='${answerLogOfCurrent.answer}']`).attr("checked", true);
                    $("input[type=radio]").attr('disabled', true);
                    $("#game9 #game-submit").text("ĐÃ NỘP BÀI");
                    $("#game9 #game-submit").off('click');
                    $("#game9 #game-submit").css("background-color", "rgb(150, 143, 143)");

                }
                else {
                    $('#game9 #game-submit').click(function () {
                        var answer = $("input[name='answer']:checked").val();
                        if (answer == undefined) {
                            alert("Vui lòng chọn đáp án");
                        }
                        else {
                            doSubmit(answer);
                            $("input[type=radio]").attr('disabled', true);
                        }
                    });
                }
                break;
            case 10:
                var topButtons = [];
                var bottomButtons = [];
                var link = question.question[0].voice;
                if (link) {
                    link = link.replace("/uploads", "https://static.edupia.vn");
                }
                if (answerLogOfCurrent) {
                    for (let i = 0; i < answerLogOfCurrent.answer.length; i++) {
                        topButtons.push(`<button class="question" id="question${i + 1}"></button>`);
                        bottomButtons.push(`<button class="answer" id="answer${i + 1}">${answerLogOfCurrent.answer[i]}</button>`);
                    }
                }
                else {
                    for (let i = 1; i < question.question.length; i++) {
                        topButtons.push(`<button class="question" id="question${i}">${question.question[i].value}</button>`);
                        bottomButtons.push(`<button class="answer" id="answer${i}"></button>`);
                    }
                }
                var topElement = topButtons.reduce(function (str, button) {
                    return str + button;
                }, "");
                var bottomElement = bottomButtons.reduce(function (str, button) {
                    return str + button;
                }, "");

                $('#play-game').html(`<div id="game10" class="game-main-body">
                                        <button id="audio-wrap">
                                            <audio id="audio_game10" src="${link}"></audio>
                                            <img src="/images/game_tttt/icon/icon_volume.svg">
                                            <p>Click to listen</p>
                                        </button>
                                        <div class="questions">${topElement}</div>
                                        <img src="/images/game_tttt/blue-arrow-down-icon-png-11.png" id="arrowdown">
                                        <div class="answers">${bottomElement}</div>
                                        <p id="right-answer"></p>
                                        <div id="game-submit">NỘP BÀI</div>
                                    </div>`);
                var count = question.question.length - 1;
                $('#audio-wrap').click(function () {
                    $('#audio_game10')[0].play();
                });
                if (answerLogOfCurrent) {
                    $("#game10 #game-submit").text("ĐÃ NỘP BÀI");
                    $("#game10 #game-submit").off('click');
                    $("#game10 #game-submit").css("background-color", "rgb(150, 143, 143)");
                }
                else {
                    $('#game10 .questions .question').click(function (event) {
                        var x = event.target;
                        if (x.textContent) {
                            for (let i = 1; i <= count; i++) {
                                var selector = "#answer" + i;
                                if (!$(selector).text()) {
                                    $(selector).text(x.textContent);
                                    $(selector).attr("question", x.id);
                                    x.innerText = "";
                                }
                            }
                        }
                    });
                    $('#game10 .answers .answer').click(function (event) {
                        var x = event.target;
                        var selector = "#" + x.getAttribute("question");
                        if (selector && x.textContent) {
                            $(selector).text(x.textContent);
                            x.innerText = "";
                        }
                    });
                    $('#game10 #game-submit').click(function () {
                        var answer = [];
                        for (let i = 1; i <= count; i++) {
                            var selector = "#answer" + i;
                            if (!$(selector).text()) {
                                answer = [];
                                break;
                            }
                            answer.push($(selector).text());
                        }
                        if (answer.length === 0) {
                            alert("Bạn chưa sắp xếp xong");
                        }
                        else {
                            doSubmit(answer);
                            $('#game10 .answers .answer').off('click');
                        }
                    });
                }
                break;
            default:
            // Default
        }
    }
});

getUrlParameter = function (sParam) {
    let sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split("&"),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split("=");

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined
                ? true
                : decodeURIComponent(sParameterName[1]);
        }
    }
};

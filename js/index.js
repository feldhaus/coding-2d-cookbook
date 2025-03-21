jQuery(document).ready(function ($) {
  const editorOptions = {
    mode: 'javascript',
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    viewportMargin: Infinity,
    lineWrapping: true,
  };

  const clickType = 'click';

  let editor;

  const loadSnippets = function () {
    $.getJSON('js/manifest.json', function (data) {
      const sections = Object.keys(data);
      for (let i = 0; i < sections.length; i++) {
        let html =
          '<span class="section" data-section="' +
          sections[i] +
          '">' +
          sections[i] +
          '</span><ul data-section="' +
          sections[i] +
          '">';
        let items = data[sections[i]];

        for (let j = 0; j < items.length; j++) {
          html +=
            '<li data-src="' +
            items[j].entry +
            '" data-descr="' +
            items[j].descr +
            '" data-controls="' +
            JSON.stringify(items[j].controls || '').replace(/"/g, "'") +
            '">' +
            items[j].title +
            '</li>';
        }
        html += '</ul>';

        $('.main-menu').append(html);
      }

      initNav();
    });
  };

  const initNav = function () {
    $('.main-menu .section').on(clickType, function () {
      $(this).next('ul').slideToggle(250);
      $(this).toggleClass('open');
    });

    $('.main-menu li').on(clickType, function () {
      if (!$(this).hasClass('selected')) {
        window.location.hash =
          '/' +
          $(this).parent().attr('data-section') +
          '/' +
          $(this).attr('data-src');
        document.title = $(this).text();

        $('.main-menu li.selected').removeClass('selected');
        $(this).addClass('selected');

        $('.main-content h1').text($(this).text());
        $('.main-content h2').text($(this).attr('data-descr'));

        addControls($(this).attr('data-controls'));

        $.ajax({
          url:
            'js/' +
            $(this).parent().attr('data-section') +
            '/' +
            $(this).attr('data-src'),
          dataType: 'text',
          success: function (data) {
            generateIFrameContent(data);
          },
        });
      }
    });

    // Deep link
    if (window.location.hash !== '') {
      const hash = window.location.hash.replace('#/', '');
      const arr = hash.split('/');
      if (arr.length > 1) {
        if (
          $('.main-menu .section[data-section="' + arr[0] + '"]').length > 0
        ) {
          $('.main-menu .section[data-section="' + arr[0] + '"]').trigger(
            clickType,
          );
          if (
            $('.main-menu .section[data-section="' + arr[0] + '"]')
              .next()
              .find('li[data-src="' + arr[1] + '"]').length > 0
          ) {
            $('.main-menu .section[data-section="' + arr[0] + '"]')
              .next()
              .find('li[data-src="' + arr[1] + '"]')
              .trigger(clickType);
          }
        }
      }
    } else {
      $('.main-menu .section').eq(0).trigger(clickType);
      $('.main-menu li').eq(0).trigger(clickType);
    }

    // Refresh Button
    $('.reload').on(clickType, function () {
      const sourceCode = editor.getValue();
      generateIFrameContent(sourceCode);
    });
  };

  const addControls = function (data) {
    $('.slider-container').remove();
    window.controlsData = {};

    const controls = JSON.parse(data.replace(/'/g, '"'));
    if (!controls) return;

    const sliderContainer = $('<div class="slider-container"></div>');

    controls.forEach(({ key, min, max, value, step }, index) => {
      const sliderLabel = $(`<label for="slider-${index}">${key}: </label>`);
      const sliderInput = $(
        `<input type="range" id="slider-${index}" min="${min}" max="${max}" step="${step}" value="${value}">`,
      );
      const sliderValue = $(`<span id="slider-value-${index}">${value}</span>`);

      // Update the value as the slider is moved
      sliderInput.on('input', function () {
        const value = Number(sliderInput.val());
        sliderValue.text(value);

        const percentage = ((value - min) / (max - min)) * 100;
        sliderInput.css(
          'background',
          `linear-gradient(to right, #ec407a ${percentage}%, #ddd ${percentage}%)`,
        );

        window.controlsData[key] = value;

        // Send the slider value to the iframe
        const iframe = document.getElementById('preview');
        const iframeWindow = iframe.contentWindow;
        iframeWindow.postMessage({ type: 'sliderinput', key, value }, '*');
      });
      sliderInput.trigger('input');

      sliderInput.on('change', function () {
        const value = Number(sliderInput.val());

        // Send the slider value to the iframe
        const iframe = document.getElementById('preview');
        const iframeWindow = iframe.contentWindow;
        iframeWindow.postMessage({ type: 'sliderchange', key, value }, '*');
      });

      // Append the elements to the container
      const sliderRow = $('<div class="slider-row"></div>');
      sliderRow.append(sliderLabel).append(sliderInput).append(sliderValue);
      sliderContainer.append(sliderRow);
    });

    // Insert the slider as a sibling of #example
    $('#example').parent().append(sliderContainer);
  };

  const generateIFrameContent = function (sourceCode) {
    // Remove all iFrames and content
    const iframes = document.querySelectorAll('iframe');
    for (var i = 0; i < iframes.length; i++) {
      iframes[i].parentNode.removeChild(iframes[i]);
    }
    $('#example').html('<iframe id="preview" src="blank.html"></iframe>');

    $('.CodeMirror').remove();
    $('.main-content #code').html(sourceCode);

    // Generate HTML and insert into iFrame
    const pixiUrl = 'https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.min.js';

    let html =
      '<!DOCTYPE html><html><head><style>body,html{margin:0px;height:100%;overflow:hidden;}canvas{width:100%;height:100%;}</style></head><body>';
    html +=
      '<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>';
    html +=
      '<script src="https://cdn.jsdelivr.net/npm/@feldhaus/math@1.1.1/dist/index.umd.min.js"></script>';
    html +=
      '<script src="https://cdn.jsdelivr.net/npm/@feldhaus/vector@1.1.2/dist/index.umd.min.js"></script>';
    html += '<script src="' + pixiUrl + '"></script>';

    html +=
      '<script>window.onload = function(){' +
      sourceCode +
      '}</script></body></html>';
    editor = CodeMirror.fromTextArea(
      document.getElementById('code'),
      editorOptions,
    );
    $('#code-header').text('Example Code');

    const iframe = document.getElementById('preview');
    const frameDoc = iframe.contentDocument || iframe.contentWindow.document;

    frameDoc.open();
    frameDoc.write(html);
    frameDoc.close();
  };

  loadSnippets();
});

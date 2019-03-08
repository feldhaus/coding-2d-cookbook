jQuery(document).ready(function($) {
    const editorOptions = {
        mode: 'javascript',
        lineNumbers: true,
        styleActiveLine: true,
        matchBrackets: true,
        viewportMargin: Infinity,
        lineWrapping: true
    };
    
    const clickType = 'click';

    let editor;

    const loadExamples = function() {
        $.getJSON('js/examples/manifest.json', function(data) {
            const sections = Object.keys(data);
            for (let i = 0; i < sections.length; i++) {
                let html = '<span class="section" data-section="' + sections[i] + '">' + sections[i] + '</span><ul data-section="' + sections[i] + '">';
                let items = data[sections[i]];

                for (let j = 0; j < items.length; j++) {
                    // const plugins = typeof items[j].plugins !== 'undefined' ? items[j].plugins.join(',') : '';
                    // const validVersions = typeof items[j].validVersions !== 'undefined' ? items[j].validVersions.join(',') : '';
                    // html += '<li data-src="' + items[j].entry + '" data-plugins="' + plugins  + '" data-validVersions="' + validVersions + '">' + items[j].title + '</li>';
                    html += '<li data-src="' + items[j].entry + '" data-descr="' + items[j].descr + '">' + items[j].title + '</li>';
                }
                html += '</ul>';

                $('.main-menu').append(html);
            }

            initNav();
        });
    };

    const initNav = function() {
        $('.main-menu .section').on(clickType, function() {
            $(this).next('ul').slideToggle(250);
            $(this).toggleClass('open');
        });

        $('.main-menu li').on(clickType, function() {
            if (!$(this).hasClass('selected')) {
                window.location.hash = '/' + $(this).parent().attr('data-section') + '/' + $(this).attr('data-src');
                document.title = $(this).text();

                $('.main-menu li.selected').removeClass('selected');
                $(this).addClass('selected');

                $('.main-content h1').text($(this).text());
                $('.main-content h2').text($(this).attr('data-descr'));

                $.ajax({
                    url: 'js/examples/' + $(this).parent().attr('data-section') + '/' + $(this).attr('data-src'),
                    dataType: "text",
                    success: function(data) {
                        generateIFrameContent(data);
                    }
                });
            }
        });

        // Deep link
        if (window.location.hash !== '') {
            const hash = window.location.hash.replace('#/', '');
            const arr = hash.split('/');
            if (arr.length > 1) {
                if ($('.main-menu .section[data-section="' + arr[0] + '"]').length > 0) {
                    $('.main-menu .section[data-section="' + arr[0] + '"]').trigger(clickType);
                    if ($('.main-menu .section[data-section="' + arr[0] + '"]').next().find('li[data-src="' + arr[1] + '"]').length > 0) {
                        $('.main-menu .section[data-section="' + arr[0] + '"]').next().find('li[data-src="' + arr[1] + '"]').trigger(clickType);
                    }
                }
            }
        } else {
            $('.main-menu .section').eq(0).trigger(clickType);
            $('.main-menu li').eq(0).trigger(clickType);
        }

        // Refresh Button
        $('.reload').on(clickType, function() {
            const sourceCode = editor.getValue();
            generateIFrameContent(sourceCode);
        });
    }

    const generateIFrameContent = function(sourceCode) {
        // Remove all iFrames and content
        const iframes = document.querySelectorAll('iframe');
        for (var i = 0; i < iframes.length; i++) {
            iframes[i].parentNode.removeChild(iframes[i]);
        }
        $('#example').html('<iframe id="preview" src="blank.html"></iframe>');

        $('.CodeMirror').remove();
        $('.main-content #code').html(sourceCode);

        // Generate HTML and insert into iFrame
        const pixiUrl = 'https://d157l7jdn8e5sf.cloudfront.net/release/pixi.js';

        let html = '<!DOCTYPE html><html><head><style>body,html{margin:0px;height:100%;overflow:hidden;}canvas{width:100%;height:100%;}</style></head><body>';
        html += '<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>';
        html += '<script src="' + pixiUrl + '"></script>';

        html += '<script>window.onload = function(){'+ sourceCode + '}</script></body></html>';
        editor = CodeMirror.fromTextArea(document.getElementById('code'), editorOptions);
        $('#code-header').text("Example Code");

        const iframe = document.getElementById('preview');
        const frameDoc = iframe.contentDocument || iframe.contentWindow.document;

        frameDoc.open();
        frameDoc.write(html);
        frameDoc.close();
    };

    loadExamples();
});

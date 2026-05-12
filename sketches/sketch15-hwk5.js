// Instance-mode sketch for tab 15
registerSketch('sk15', function (p) {

  p.setup = function () {
    // 不需要 p5 画布，用 DOM 直接嵌入 Tableau
    p.noCanvas();

    // 创建 Tableau 容器 div
    let vizDiv = p.createDiv('');
    vizDiv.id('viz1778577497967');
    vizDiv.class('tableauPlaceholder');
    vizDiv.style('position', 'relative');

    // 写入 noscript 备用图片 + object 标签
    vizDiv.html(`
      <noscript>
        <a href='#'>
          <img alt='Bay Area Map'
               src='https://public.tableau.com/static/images/AI/AIBoomBayAreaAffordability/BayAreaMap/1_rss.png'
               style='border: none' />
        </a>
      </noscript>
      <object class='tableauViz' style='display:none;'>
        <param name='host_url'          value='https%3A%2F%2Fpublic.tableau.com%2F' />
        <param name='embed_code_version' value='3' />
        <param name='site_root'         value='' />
        <param name='name'              value='AIBoomBayAreaAffordability/BayAreaMap' />
        <param name='tabs'              value='no' />
        <param name='toolbar'           value='yes' />
        <param name='animate_transition' value='yes' />
        <param name='display_static_image' value='yes' />
        <param name='display_spinner'   value='yes' />
        <param name='display_overlay'   value='yes' />
        <param name='display_count'     value='yes' />
        <param name='language'          value='en-US' />
        <param name='filter'            value='publish=yes' />
      </object>
    `);

    // 动态注入 Tableau API 脚本 + 初始化逻辑
    let script = p.createElement('script');
    script.attribute('type', 'text/javascript');
    script.elt.textContent = `
      (function() {
        var divElement  = document.getElementById('viz1778577497967');
        var vizElement  = divElement.getElementsByTagName('object')[0];
        var w = divElement.offsetWidth;
        if (w > 800) {
          vizElement.style.width  = '1000px';
          vizElement.style.height = '827px';
        } else if (w > 500) {
          vizElement.style.width  = '1000px';
          vizElement.style.height = '827px';
        } else {
          vizElement.style.width  = '100%';
          vizElement.style.height = '1177px';
        }
        var scriptElement = document.createElement('script');
        scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
        vizElement.parentNode.insertBefore(scriptElement, vizElement);
      })();
    `;
    p.select('body').child(script);
  };

  // draw 留空即可，Tableau 是静态 DOM 元素
  p.draw = function () {};

});
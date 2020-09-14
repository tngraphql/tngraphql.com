const highlight = require('./highlight')

/**
 * Recursively visit a given ast nodes
 */
function visit (node, tag, callback) {
  if (node.tag === tag) {
    callback(node)
  }

  if (node.children) {
    return node.children.map((child) => visit(child, tag, callback))
  }
}

function ChangeToSlug(title) {
  var slug;

  //Đổi chữ hoa thành chữ thường
  slug = title.toLowerCase();

  //Đổi ký tự có dấu thành không dấu
  slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
  slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
  slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
  slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
  slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
  slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
  slug = slug.replace(/đ/gi, 'd');
  //Xóa các ký tự đặt biệt
  slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
  //Đổi khoảng trắng thành ký tự gạch ngang
  slug = slug.replace(/ /gi, "-");
  //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
  //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
  slug = slug.replace(/\-\-\-\-\-/gi, '-');
  slug = slug.replace(/\-\-\-\-/gi, '-');
  slug = slug.replace(/\-\-\-/gi, '-');
  slug = slug.replace(/\-\-/gi, '-');
  //Xóa các ký tự gạch ngang ở đầu và cuối
  slug = '@' + slug + '@';
  slug = slug.replace(/\@\-|\-\@|\@/gi, '');
  //In slug ra textbox có id “slug”

  return slug;
}

function slugLinkHeading(node) {
  if ( ! node.props.id ) {
    return
  }
  const link = ChangeToSlug(node.props.id);
  for(let item of node.children ) {
    if ( item.props ) {
      item.props.href = '#' + link;
    }
  }
  node.props.id = link;
}

module.exports = function compileCode (hooks) {
  hooks.before('doc', ({ doc }) => {
    visit(doc.content, 'h1', slugLinkHeading);
    visit(doc.content, 'h2', slugLinkHeading);
    visit(doc.content, 'h3', slugLinkHeading);
    visit(doc.content, 'h4', slugLinkHeading);
    visit(doc.content, 'div', (node) => {
      if ( ! node.props.className ) {
        return
      }
      if ( !node.props.className.includes('toc-container') ) {
        return;
      }

      visit(node, 'a', node => {
        const link = ChangeToSlug(node.children[0].value);
        node.props.href = '#' + link;
      })

    });
    visit(doc.content, 'pre', (node) => {
      node.children[0].children[0].value = highlight(
        node.children[0].children[0].value,
        node.props.className[0],
        node.props.dataLine,
      )
    })
  })
}

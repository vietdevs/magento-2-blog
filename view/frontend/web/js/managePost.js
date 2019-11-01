/**
 * Mageplaza
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Mageplaza.com license that is
 * available through the world-wide-web at this URL:
 * https://www.mageplaza.com/LICENSE.txt
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade this extension to newer
 * version in the future.
 *
 * @category    Mageplaza
 * @package     Mageplaza_Blog
 * @copyright   Copyright (c) Mageplaza (https://www.mageplaza.com/)
 * @license     https://www.mageplaza.com/LICENSE.txt
 */
define([
    'jquery',
    'mage/translate',
    'underscore',
    'Magento_Ui/js/modal/modal',
    'uiRegistry',
    'moment',
    "mage/adminhtml/events",
    "mage/adminhtml/wysiwyg/tiny_mce/setup"
], function ($, $t, _, modal, registry, moment) {
    'use strict';

    $.widget('mageplaza.mpBlogManagePost', {
            options: {
                deleteUrl: '',
                basePubUrl: '',
                postDatas: {}
            },
            _create: function () {
                var self      = this,
                    htmlPopup = $('#mp-blog-new-post-popup');

                $('.mp-blog-new-post button').on('click', function () {
                    self._AddNewPost(self, htmlPopup);
                });

                $('.mpblog-post-edit').on('click', function () {
                    self._EditPost(self, this, htmlPopup);
                });

                $('.mpblog-post-duplicate').on('click', function () {
                    self._DuplicatePost(self, this, htmlPopup);
                });

                $('.mpblog-post-delete').on('click', function () {
                    self._DeletePost(self, this);
                });
            },
            _AddNewPost: function (self, htmlPopup) {
                var options = {
                    'type': 'popup',
                    'title': $t('Add New Post'),
                    'responsive': true,
                    'innerScroll': true,
                    'buttons': []
                };
                self._resetForm('');
                self._openPopup(options, htmlPopup);
            },
            _resetForm: function (postContent) {
                var iframe = document.getElementById('post_content_ifr');;

                $('#mp_blog_post_form').trigger("reset");
                $('#short_description').empty();
                $('#post_content').empty();
                $('#post_id').removeAttr('value');

                if (iframe){
                    iframe.contentWindow.document.open();
                    iframe.contentWindow.document.write(postContent);
                    iframe.contentWindow.document.close();
                }

                $('.mp-field .mp-image-link').remove();
                registry.get('customCategory').value('');
                registry.get('customTag').value('');
                registry.get('customTopic').value('');
            },
            _EditPost: function (self, click, htmlPopup) {
                var postId   = $(click).parent().data('postid'),
                    postData = self.options.postDatas[postId],
                    pubUrl   = self.options.basePubUrl,
                    options  = {
                        'type': 'popup',
                        'title': $t('Edit Post'),
                        'responsive': true,
                        'innerScroll': true,
                        'buttons': []
                    };

                if (htmlPopup.find('#mp_blog_post_form [name="name"]').length > 0) {
                    self._resetForm(postData['post_content']);
                }
                self._openPopup(options, htmlPopup);
                self._setPopupFormData(postData, pubUrl, htmlPopup);
            },
            _setPopupFormData: function(postData, pubUrl, htmlPopup){
                _.each(postData, function (value, name) {
                    var field = htmlPopup.find('#mp_blog_post_form [name="' + name + '"]'),
                        imageEL,
                        date;

                    if (field.is('[type="file"]') && value) {
                        imageEL = '<a class="mp-image-link" href="' + pubUrl + 'mageplaza/blog/post/' + value + '" onclick="imagePreview(\'post_image_image\'); return false;" >' +
                            '<img src="' + pubUrl + 'mageplaza/blog/post/' + value + '" id="post_image_image"' +
                            ' title="' + value + '" alt="' + value + '" height="22" width="22"' +
                            ' class="small-image-preview v-middle">' +
                            '<input type="hidden" name="sub_image" id="sub_image" value="'+value+'" />' +
                            '</a>';
                        field.parent().prepend(imageEL);
                    } else if (field.is('[type="datetime-local"]')) {
                        date = moment(value).format("YYYY-MM-DDTkk:mm");
                        field.val(date);
                    } else if (field.is('input') || field.is('select')) {
                        field.val(value);
                    } else if (field.is('textarea')) {
                        field.html(value);
                    }
                    if (name === 'category_ids') {
                        registry.get('customCategory').value(value);
                    }
                    if (name === 'tag_ids') {
                        registry.get('customTag').value(value);
                    }
                    if (name === 'topic_ids') {
                        registry.get('customTopic').value(value);
                    }
                });
            },
            _DuplicatePost: function (self, click, htmlPopup) {
                var postId   = $(click).parent().data('postid'),
                    postData = self.options.postDatas[postId],
                    pubUrl   = self.options.basePubUrl,
                    options  = {
                        'type': 'popup',
                        'title': $t('Duplicate Post'),
                        'responsive': true,
                        'innerScroll': true,
                        'buttons': []
                    };

                if (htmlPopup.find('#mp_blog_post_form [name="name"]').length > 0) {
                    self._resetForm(postData['post_content']);
                }
                self._openPopup(options, htmlPopup);
                self._setPopupFormData(postData, pubUrl, htmlPopup);
                $('#post_id').removeAttr('value');
            },
            _DeletePost: function (self, widget) {
                var url = self.options.deleteUrl,
                    id = $(widget).parent().data('postid');

                $.ajax({
                    url: url,
                    type: "post",
                    data: {
                        post_id: id
                    },
                    showLoader: true,
                    success: function (result) {
                        if (result['status'] === 1){
                            $('.post-list-item[data-post-id="'+result['post_id']+'"]').remove();
                        }
                    },
                    complete: function () {

                    }
                });
            },
            _openPopup: function (options, htmlPopup) {
                var popupModal,
                    wysiwygcompany_description;

                popupModal = modal(options, htmlPopup);
                popupModal.openModal();
                $('#mp_blog_post_form').trigger('contentUpdated');

                wysiwygcompany_description = new wysiwygSetup("post_content", {
                    "width": "99%",
                    "height": "200px",
                    "plugins": [{"name": "image"}],
                    "tinymce4": {
                        "toolbar": "formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link table charmap",
                        "plugins": "advlist autolink lists link charmap media noneditable table contextmenu paste code help table"
                    }
                });
                wysiwygcompany_description.setup("exact");
            }
        }
    );

    return $.mageplaza.mpBlogManagePost;
});

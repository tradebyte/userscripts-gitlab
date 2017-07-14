// ==UserScript==
// @name         gitlab show Approvals at MergeRequests
// @namespace    http://www.tradebyte.com/
// @version      0.2
// @description  Shows MR approvals.
// @author       Tino Dietel
// @match        https://gitlab.com/*/merge_requests
// ==/UserScript==

(function() {
    'use strict';

    let $mrs = jQuery('.mr-list li.merge-request');
    let globalProjectID = jQuery('#search_project_id').val();
    let apiPrefix = 'https://gitlab.com/api/v4/';
    let placeholder = '<a href="" data-container="body" class="author_link disabled"><svg width="20" height="20" class="s20 avatar avatar-inline avatar-placeholder"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 27 27"><path fill="#bfbfbf" fill-rule="evenodd" d="m13.5 26.5c1.412 0 2.794-.225 4.107-.662l-.316-.949c-1.212.403-2.487.611-3.792.611v1m6.06-1.495c1.234-.651 2.355-1.498 3.321-2.504l-.721-.692c-.892.929-1.928 1.711-3.067 2.312l.467.884m4.66-4.147c.79-1.149 1.391-2.418 1.777-3.762l-.961-.276c-.356 1.24-.911 2.411-1.64 3.471l.824.567m2.184-5.761c.063-.518.096-1.041.097-1.568 0-.896-.085-1.758-.255-2.603l-.98.197c.157.78.236 1.576.236 2.405-.001.486-.031.97-.09 1.448l.993.122m-.738-6.189c-.493-1.307-1.195-2.523-2.075-3.605l-.776.631c.812.999 1.46 2.122 1.916 3.327l.935-.353m-3.539-5.133c-1.043-.926-2.229-1.68-3.512-2.229l-.394.919c1.184.507 2.279 1.203 3.242 2.058l.664-.748m-5.463-2.886c-1.012-.253-2.058-.384-3.119-.388-.378 0-.717.013-1.059.039l.077.997c.316-.024.629-.036.98-.036.979.003 1.944.124 2.879.358l.243-.97m-6.238-.022c-1.361.33-2.653.878-3.832 1.619l.532.847c1.089-.684 2.281-1.189 3.536-1.494l-.236-.972m-5.517 2.878c-1.047.922-1.94 2.01-2.643 3.212l.864.504c.649-1.112 1.474-2.114 2.441-2.966l-.661-.75m-3.54 5.076c-.499 1.293-.789 2.664-.854 4.072l.999.046c.06-1.3.328-2.564.788-3.758l-.933-.36m-.78 6.202c.163 1.396.549 2.744 1.14 4l.905-.425c-.545-1.16-.902-2.404-1.052-3.692l-.993.116m2.177 5.814c.788 1.151 1.756 2.169 2.866 3.01l.606-.796c-1.025-.78-1.919-1.721-2.646-2.783l-.825.565m4.665 4.164c1.23.65 2.559 1.1 3.943 1.328l.162-.987c-1.278-.21-2.503-.625-3.638-1.225l-.468.884m6.02 1.501c.024 0 .024 0 .048 0v-1c-.022 0-.022 0-.044 0l-.004 1"></path></svg></svg></a>';
    let projectCache = {};

    $mrs.each(function(){
        let $mergeR = jQuery(this);
        let url = $mergeR.find('.merge-request-title-text a').prop('href');
        let merge_request_iid = url.split("/").pop();
        let thisProjectID = globalProjectID;

        if(thisProjectID === '') {
            let projectName = $mergeR.find('.merge-request-title-text a').attr('href');
                projectName = projectName.substring(1, projectName.indexOf('/merge_requests/'));
                // the projectID may be preplaced with the full name (and namespace of the project)
                thisProjectID = encodeURIComponent(projectName);
        }

        let apiUrl = apiPrefix + 'projects/' + thisProjectID + '/merge_requests/' + merge_request_iid + '/approvals';

        jQuery.ajax({
            url : apiUrl,
            success : function(data){
                let iconTarget = $mergeR.find('.controls');
                iconTarget.append('<li style="max-height: 20px;overflow-y: hidden;"><div class="approvers-list" style="display:flex"></div></li>');
                iconTarget = iconTarget.find('.approvers-list');

                if(data.approved_by.length > 0) {
                    jQuery.each(data.approved_by, function(i, approver) {
                        let avatar = '<a href="'+approver.user.wep_url+'" title="" data-container="body" class="author_link has-tooltip approver-avatar " data-original-title="'+
                            approver.user.name+'"><img src="'+approver.user.avatar_url+'" width="20" height="20" alt="Niklas Heer" class="avatar avatar-inline s20 "></a>';
                        iconTarget.prepend(avatar);
                    });
                }

                if(data.approvals_left > 0) {
                    for(let x = 1; x <= data.approvals_left; x++) {
                        iconTarget.prepend(placeholder);
                    }
                }
            }
        });
    });
})();

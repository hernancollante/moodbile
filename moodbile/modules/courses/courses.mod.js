Moodbile.behaviorsPatterns.courses = function(context){
    var context = context || document;
    
    var checkUserVariable = setInterval(function() {
        if(Moodbile.user != null) {
            clearInterval(checkUserVariable);
            var userids = [Moodbile.user.id]
            var petitionOpts = {"wsfunction":"moodle_course_get_courses_by_userid", "userids": userids};
            Moodbile.json(context,  petitionOpts, Moodbile.jsonCallbacks.courses, true);
        }
    }, Moodbile.intervalDelay);
    
    //Es necesario esperar un tiempo hasta que se complete el request inicial para 
    var loadFrontpage = setInterval(function(){
        if (Moodbile.enroledCoursesid.length != 0){
            clearInterval(loadFrontpage);
            Moodbile.aux.frontpage(context);
        }
    }, Moodbile.intervalDelay);
    
    $('.moodbile-course a').live('click', function(){
        var id = $(this).parent().attr('id');
        
        $('section:visible').hide();
        $('.frontpage-'+id).show();
        
        return false;
    });
}

Moodbile.jsonCallbacks.courses = function(json) {
    var callback = function(){
        var itemHTML = $('#wrapper .moodbile-courses-links').find('.moodbile-courses:eq(0)').html();
        
        $.each(json, function(i, json){
            var currentItem = $('#wrapper .moodbile-courses-links').find('.moodbile-courses:eq(0)');
            
            currentItem.append(itemHTML);
            currentItem.find('.moodbile-course:last-child').attr('id', json.id).addClass(json.format);
            currentItem.find('.moodbile-course:last-child').find('.course-title').attr('title', json.title).append(json.title);
            currentItem.find('.moodbile-course:last-child').find('.info').find('.summary').append(json.summary);
            
            Moodbile.enroledCoursesid[i] = json.id;
        });
        
        $('.moodbile-course:first-child').remove();
    }
    
    Moodbile.loadTemplate('courses', '#wrapper', callback);
}

Moodbile.aux.frontpage = function(context){
    var context = context || document;
    
    var callback = function() {
        var itemInnerHTML = null;
        var itemHTML = null;
       
        $.each(Moodbile.enroledCoursesid, function(){
            var id = this.toString();
            
            sectionInnerHTML = $('.moodbile-frontpage:eq(0) .moodbile-course-section').html();
            itemInnerHTML = $('.moodbile-frontpage:eq(0) .moodbile-frontpage-fragment').html();
            itemHTML = $('.moodbile-frontpage:eq(0)').html();
            
            $('.moodbile-frontpage:eq(0)').clone().appendTo('#wrapper');
            
            var sectionsLength = $('.moodbile-frontpage').length-1;
            $('.moodbile-frontpage:eq('+sectionsLength+')').addClass('frontpage-'+ id);
            $('.frontpage-'+ id).hide();
            
        });
    
        var loadFrontpage = setInterval(function(){
            if(Moodbile.requestJson.moodle_course_get_courses_by_userid != null && Moodbile.requestJson.resources != null && Moodbile.requestJson.events != null && Moodbile.requestJson.forums != null) {
                clearInterval(loadFrontpage);
            
                Moodbile.jsonCallbacks.frontpage(Moodbile.requestJson.moodle_course_get_courses_by_userid, itemInnerHTML);
                Moodbile.jsonCallbacks.frontpageResources(Moodbile.requestJson.resources, sectionInnerHTML);
                Moodbile.jsonCallbacks.frontpageEvents(Moodbile.requestJson.events, sectionInnerHTML);
                Moodbile.jsonCallbacks.frontpageForums(Moodbile.requestJson.forums, sectionInnerHTML);
            }
        }, Moodbile.intervalDelay);
        
        $('.moodbile-frontpage-fragment:first-child').remove();
        $('.moodbile-frontpage:visible').remove();
    }
    
    Moodbile.loadTemplate('frontpage', '#wrapper', callback);
}

Moodbile.jsonCallbacks.frontpage = function(json, itemHTML){
    var expanded = 1;
    
    $.each(json, function(i, json){
        $.each(json.sections, function(i, data){
            var currentItem = $('#wrapper .frontpage-'+json.id);
            currentItem.append(itemHTML);
            
            if (expanded == 1){
                currentItem.find('.moodbile-course-section:last-child').addClass(data.sectionid.toString());
                
                expanded += 1;
            } else {
                currentItem.find('.moodbile-course-section:last-child').addClass(data.sectionid.toString());
            }
            
            currentItem.find('.moodbile-course-section:last-child').find('div').addClass('summary');
            currentItem.find('.moodbile-course-section:last-child').find('.summary').find('a').addClass('collapse').append(data.summary);
            currentItem.find('.moodbile-course-section:last-child').find('.summary').find('.moodbile-icon').addClass('collapse-icon');
        });
    });
}

Moodbile.jsonCallbacks.frontpageResources = function(json, itemHTML){
    $.each(json, function(i, json){
        var currentItem = $('#wrapper .frontpage-'+json.courseid).find('.'+json.resource.section).find('.summary');
        currentItem.append(itemHTML);
        
        currentItem.find('div:last-child').addClass('resource ' + json.resource.id + ' fx collapsible collapsed');
        currentItem.find('div:last-child').find('a').append(json.resource.title);
        currentItem.find('div:last-child').find('.moodbile-icon').addClass('icon-'+json.resource.type);
    }); 
}

Moodbile.jsonCallbacks.frontpageEvents = function(json, itemHTML){
    $.each(json, function(i, json){
        var currentItem = $('#wrapper .frontpage-'+json.courseid).find('.'+json.section).find('.summary');
        currentItem.append(itemHTML);
        
        currentItem.find('div:last-child').addClass('event ' + json.id + ' fx collapsible collapsed');
        currentItem.find('div:last-child').find('a').append(json.title);
        currentItem.find('div:last-child').find('.moodbile-icon').addClass('icon-'+json.type);
    });
}

Moodbile.jsonCallbacks.frontpageForums = function(json, itemHTML){
    $.each(json, function(i, json){
        var currentItem = $('#wrapper .frontpage-'+json.courseid).find('.'+json.section).find('.summary');
        currentItem.append(itemHTML);
        
        currentItem.find('div:last-child').addClass('forum ' + json.id + ' collapsible collapsed');
        currentItem.find('div:last-child').find('a').append(json.title);
        currentItem.find('div:last-child').find('.moodbile-icon').addClass('icon-'+json.type);
    });
}
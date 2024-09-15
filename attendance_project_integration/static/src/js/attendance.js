odoo.define('attendance_project_integration.my_attendance', function (require) {
    "use strict";
    
    var MyAttendances = require('hr_attendance.my_attendances');
    var core = require('web.core');
    const session = require('web.session');
    var field_utils = require('web.field_utils');

    var MyCustomAttendances = MyAttendances.include({
        events: _.extend({}, MyAttendances.prototype.events, {
            'change #project_id': 'onProjectChange',
        }),

        willStart: function () {
            var self = this;

            var def = this._rpc({
                model: 'hr.employee',
                method: 'search_read',
                args: [[['user_id', '=', this.getSession().uid]], ['attendance_state', 'name', 'hours_today']],
                context: session.user_context,
            })
            .then(function (res) {
                self.employee = res.length && res[0];
                if (res.length) {
                    self.hours_today = field_utils.format.float_time(self.employee.hours_today);
                }
            });

            var project = this._rpc({
                model: 'project.project',
                method: 'search_read',
                args: [[],['name','id']],
                context: session.user_context,
            }).then(function (res){
                self.projects = res;
                self.tasks = [];
            });

            return Promise.all([def,project,this._super.apply(this,arguments)]);
        },



        onProjectChange: function (e) {
            var self = this;
            var projectId = e.target.value;

            // Fetch tasks related to the selected project
            this._rpc({
                model: 'project.task',
                method: 'search_read',
                args: [[['project_id', '=', parseInt(projectId)]], ['name', 'id']],
                context: session.user_context,
            }).then(function (tasks) {
                self.tasks = tasks;
                self.renderTasks();  // Re-render task dropdown
            });
        },

        renderTasks: function () {

            if(!this.$el){
                return;
            }
            var $taskSelect = this.$el.find('select[name="task_id"]');
            $taskSelect.empty();
            if (this.tasks.length > 0) {
                this.tasks.forEach(function (task) {
                    var option = $('<option/>', { value: task.id }).text(task.name);
                    $taskSelect.append(option);
                });
            } else {
                $taskSelect.append($('<option/>').text('No tasks available'));
            }
        },

        update_attendance: function () {
            var self = this;
            var projectId = this.$el.find('select[name="project_id"]').val();
            var taskId = this.$el.find('select[name="task_id"]').val();
            var description = this.$el.find('textarea[name="description"]').val();
            
            if(self.employee.attendance_state === "checked_in"){
                if (!description) {
                    this.displayNotification({
                        title: "Validation Error",
                        message: "Please fill in required field Description.",
                        type: "danger",
                    });
                    return; // Stop the process if validation fails
                }
            }else{
                if (!projectId || !taskId || !description) {
                    this.displayNotification({
                        title: "Validation Error",
                        message: "Please fill in all required fields (Project, Task, and Description).",
                        type: "danger",
                    });
                    return; // Stop the process if validation fails
                }
            }

            this._rpc({
                    model: 'hr.employee',
                    method: 'attendance_manual',
                    args: [[self.employee.id], 'hr_attendance.hr_attendance_action_my_attendances',parseInt(projectId),parseInt(taskId),description],
                    context: session.user_context,
                })
                .then(function(result) {
                    if (result.action) {
                        self.do_action(result.action);
                    } else if (result.warning) {
                        self.displayNotification({ title: result.warning, type: 'danger' });
                    }
                });
        },
    });

    return MyAttendances;
});

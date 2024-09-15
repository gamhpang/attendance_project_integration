
from odoo import models, fields
import logging

class HrAttendance(models.Model):
    _inherit = 'hr.attendance'

    project_id = fields.Many2one('project.project',string="Project")
    task_id = fields.Many2one('project.task',string="Task")
    check_in_description = fields.Char("Check In Description")
    check_out_description = fields.Char("Check Out Description")

class HrEmployee(models.Model):
    _inherit = 'hr.employee'

    def attendance_manual(self, next_action, project_id=False,task_id=False,description=False,entered_pin=None,):

        attendance_action = super(HrEmployee,self).attendance_manual(next_action,entered_pin)
        
        attendance = self.env['hr.attendance'].search([('employee_id', '=', self.id)], order='check_in desc', limit=1)

        if attendance:
            update_vals = {}
            if project_id:
                update_vals['project_id'] = project_id

            if task_id:
                update_vals['task_id'] = task_id

            if description:
                if attendance.check_out:
                    update_vals['check_out_description'] = description
                else:
                    update_vals['check_in_description'] = description

            attendance.write(update_vals)

        return attendance_action

{
    'name': 'Attendance Project Integration',
    'version': '1.0',
    'category': 'Human Resources/Attendances',
    'sequence': 240,
    'summary': 'Track employee attendance',
    'description': """
Customize to integrate project with attendance.
       """,
    'website': 'https://www.odoo.com/app/employees',
    'depends': ['hr_attendance'],
    'data': [
        #'security/ir.model.access.csv',
        'views/attendance_view.xml',
    ],
    'installable': True,
    'assets': {
        'web.assets_backend': [
            'attendance_project_integration/static/src/js/attendance.js',
            'attendance_project_integration/static/src/xml/attendance.xml',
        ],
    },
    'license': 'AGPL-3',
}

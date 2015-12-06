/**
* app-i18n Module
*
* Description
*/
angular.module('app-i18n', ['pascalprecht.translate'])
	.config(['$translateProvider', function($translateProvider) {
		$translateProvider.translations('ru', {
			'personnel_number': "Табельный номер",
			'first_name': "Имя",
			'last_name': "Фамилия",
			'middle_name': "Отчество",
			'sex': "Пол",
			'age': "Возраст",
			'medical_license_number': "Номер медицинской лицензии",
			'last_accreditation_date': "Дата последней аккредитации",
			'next_accreditation_date': "Действительна до",
			'post_descr': "Должность"

		})
		$translateProvider.preferredLanguage('ru');
		$translateProvider.useSanitizeValueStrategy('escape');
	}])
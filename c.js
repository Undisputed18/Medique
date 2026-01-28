// Update the populateSimpleDoctorForm function
function populateSimpleDoctorForm() {
    if (!currentUser || !isDoctor || !simpleDoctorForm) return;
    
    // Populate basic info
    if (doctorFullName) doctorFullName.value = currentUser.full_name || '';
    if (doctorSpecializationSimple) doctorSpecializationSimple.value = currentUser.specialization || '';
    if (appointmentDuration) appointmentDuration.value = currentUser.appointment_duration || '30';
    if (maxPatientsPerDay) maxPatientsPerDay.value = currentUser.max_patients_per_day || '';
    
    // Find the first available day to get working hours
    const firstAvailableDay = doctorSchedule.find(s => s.is_available && s.start_time !== '00:00');
    
    if (firstAvailableDay) {
        if (workStartTime) workStartTime.value = firstAvailableDay.start_time;
        if (workEndTime) workEndTime.value = firstAvailableDay.end_time;
    } else {
        // Default values
        if (workStartTime) workStartTime.value = '09:00';
        if (workEndTime) workEndTime.value = '17:00';
    }
    
    // Check/uncheck day checkboxes based on schedule
    const daysMapping = {
        'Monday': mondayCheck,
        'Tuesday': tuesdayCheck,
        'Wednesday': wednesdayCheck,
        'Thursday': thursdayCheck,
        'Friday': fridayCheck,
        'Saturday': saturdayCheck,
        'Sunday': sundayCheck
    };
    
    for (const [dayName, checkbox] of Object.entries(daysMapping)) {
        if (checkbox) {
            const daySchedule = doctorSchedule.find(s => s.day === dayName);
            checkbox.checked = daySchedule ? daySchedule.is_available : false;
        }
    }
}
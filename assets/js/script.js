document.addEventListener('DOMContentLoaded', function() {
    // Check if the script has already run to prevent duplicates
    if (window.formInitialized) return;
    window.formInitialized = true;
    
    // Form validation and submission
    const form = document.querySelector('.form');
    const formContainer = document.querySelector('.form-container');
    let formElements = [];

    // Initialize form
    initForm();

    // Add click handlers to menu items
    setupMenuItemsClickHandlers();
    
    // Setup drag and drop for menu items
    setupDragAndDrop();

    function initForm() {
        // Create a submit button if it doesn't exist
        if (!form.querySelector('.submit')) {
            const submitGroup = document.createElement('div');
            submitGroup.className = 'form-group submit';
    
            const submitButton = document.createElement('button');
            submitButton.type = 'button';
            submitButton.textContent = 'Submit';
            submitButton.onclick = submitForm; // Attach the submitForm function

            
             if (document.getElementById('dynamic-form-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamic-form-styles';
    styleElement.textContent = `
        // Existing styles...
        
        .submit button {
            background-color: #FF4500;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 20px;
            cursor: pointer;
        }
        
        // Make sure the submit form-group doesn't have a white background
        .form-group.submit {
            background: transparent;
            border: none;
            padding: 0;
        }
    `;
    
    document.head.appendChild(styleElement);
    
            submitGroup.appendChild(submitButton);
            form.appendChild(submitGroup);
        }

        // Add event listener to the form submission
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (validateForm()) {
                    submitForm();
                }
            });
        }

        // Store initial form elements
        document.querySelectorAll('.form-group').forEach(group => {
            if (!group.classList.contains('submit')) {
                formElements.push({
                    element: group,
                    id: group.querySelector('input, textarea')?.id || 'unknown'
                });
            }
        });

        // Add input validation for existing phone inputs
        setupPhoneInputs();
    }

    function setupMenuItemsClickHandlers() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            // Skip if already set up
            if (item.dataset.clickInitialized) return;
            item.dataset.clickInitialized = "true";
            
            item.addEventListener('click', function() {
                addFormElement(item.textContent.trim());
            });
        });
    }
    
    function setupDragAndDrop() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            // Skip if already set up
            if (item.getAttribute('draggable') === 'true') return;
            
            item.setAttribute('draggable', 'true');
            
            item.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', item.textContent.trim());
                e.dataTransfer.effectAllowed = 'copy';
            });
        });

        // Make form container a drop target
        if (formContainer) {
            // Avoid duplicate event listeners
            formContainer.removeEventListener('dragover', handleDragOver);
            formContainer.removeEventListener('dragleave', handleDragLeave);
            formContainer.removeEventListener('drop', handleDrop);
            
            formContainer.addEventListener('dragover', handleDragOver);
            formContainer.addEventListener('dragleave', handleDragLeave);
            formContainer.addEventListener('drop', handleDrop);
        }
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        formContainer.classList.add('dragover');
    }
    
    function handleDragLeave() {
        formContainer.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        formContainer.classList.remove('dragover');
        
        const elementType = e.dataTransfer.getData('text/plain');
        addFormElement(elementType);
    }

    function addFormElement(elementType) {
        // Create new form element based on type
        const newElement = createFormElement(elementType);
        
        if (newElement && form) {
            // Insert before the submit button
            const submitBtn = form.querySelector('.submit');
            form.insertBefore(newElement, submitBtn);
            
            // Add to form elements array
            const inputId = newElement.querySelector('input, textarea')?.id || 'element-' + formElements.length;
            formElements.push({
                element: newElement,
                id: inputId
            });

            // Add remove button functionality
            const removeBtn = newElement.querySelector('.remove-element');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    removeFormElement(newElement);
                });
            }
            
            // Setup phone input validation if this is a phone input
            if (elementType.toLowerCase() === 'nömrə') {
                setupPhoneInputs();
            }
            
            // Add sort handles
            addSortHandles(newElement);
            
            // Make labels editable
            makeLabelsEditable(newElement);
        }
    }

    function createFormElement(elementType) {
        const elementDiv = document.createElement('div');
        elementDiv.className = 'card form-group';
        
        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-element';
        removeBtn.innerHTML = '<i class="fa fa-times"></i>';
        removeBtn.type = 'button';
        elementDiv.appendChild(removeBtn);
        
        // Create different elements based on type
        switch(elementType.toLowerCase()) {
            case 'başlıq': 
                elementDiv.innerHTML += `
                    <label for="heading-${Date.now()}" class="editable-label">Başlıq:</label>
                    <input type="text" id="heading-${Date.now()}" name="heading" placeholder="Başlıq daxil edin">
                `;
                break;
            case 'email':
                elementDiv.innerHTML += `
                    <label for="email-${Date.now()}" class="editable-label">Email:</label>
                    <input type="email" id="email-${Date.now()}" name="email" placeholder="Email daxil edin">
                `;
                break;
            case 'nömrə':
                elementDiv.innerHTML += `
                    <label for="phone-${Date.now()}" class="editable-label">Telefon nömrəsi:</label>
                    <input type="tel" id="phone-${Date.now()}" name="phone" placeholder="+994xxxxxxxx">
                `;
                break;
            case 'vaxt':
                elementDiv.innerHTML += `
                    <label for="time-${Date.now()}" class="editable-label">Vaxt:</label>
                    <input type="time" id="time-${Date.now()}" name="time">
                `;
                break;
            case 'qısa mətn':
                elementDiv.innerHTML += `
                    <label for="short-text-${Date.now()}" class="editable-label">Qısa mətn:</label>
                    <input type="text" id="short-text-${Date.now()}" name="shortText">
                `;
                break;
            case 'uzun mətn':
                elementDiv.innerHTML += `
                    <label for="long-text-${Date.now()}" class="editable-label">Uzun mətn:</label>
                    <textarea id="long-text-${Date.now()}" name="longText" rows="4"></textarea>
                `;
                break;
            case 'təyinat':
                elementDiv.innerHTML += `
                    <label for="assignment-${Date.now()}" class="editable-label">Təyinat:</label>
                    <select id="assignment-${Date.now()}" name="assignment">
                        <option value="">Seçin</option>
                        <option value="option1">Seçim 1</option>
                        <option value="option2">Seçim 2</option>
                        <option value="option3">Seçim 3</option>
                    </select>
                `;
                break;
            case 'tək seçim':
                elementDiv.innerHTML += `
                    <fieldset>
                        <legend class="editable-label">Tək seçim:</legend>
                        <div>
                            <input type="radio" id="option1-${Date.now()}" name="singleChoice" value="option1">
                            <label for="option1-${Date.now()}">Seçim 1</label>
                        </div>
                        <div>
                            <input type="radio" id="option2-${Date.now()}" name="singleChoice" value="option2">
                            <label for="option2-${Date.now()}">Seçim 2</label>
                        </div>
                        <div>
                            <input type="radio" id="option3-${Date.now()}" name="singleChoice" value="option3">
                            <label for="option3-${Date.now()}">Seçim 3</label>
                        </div>
                    </fieldset>
                `;
                break;
            case 'çoxlu seçim':
                elementDiv.innerHTML += `
                    <fieldset>
                        <legend class="editable-label">Çoxlu seçim:</legend>
                        <div>
                            <input type="checkbox" id="option1-${Date.now()}" name="multipleChoice" value="option1">
                            <label for="option1-${Date.now()}">Seçim 1</label>
                        </div>
                        <div>
                            <input type="checkbox" id="option2-${Date.now()}" name="multipleChoice" value="option2">
                            <label for="option2-${Date.now()}">Seçim 2</label>
                        </div>
                        <div>
                            <input type="checkbox" id="option3-${Date.now()}" name="multipleChoice" value="option3">
                            <label for="option3-${Date.now()}">Seçim 3</label>
                        </div>
                    </fieldset>
                `;
                break;
            case 'tarix':
                elementDiv.innerHTML += `
                    <label for="date-${Date.now()}" class="editable-label">Təqdimetmə tarixi:</label>
                    <input type="date" id="date-${Date.now()}" name="date">
                `;
                break;
            default:
                return null;
        }
        
        return elementDiv;
    }

    function makeLabelsEditable(element) {
        const labels = element.querySelectorAll('.editable-label, legend.editable-label');
        
        labels.forEach(label => {
            // Skip if already made editable
            if (label.dataset.editable) return;
            label.dataset.editable = "true";
            
            // Add editable indicator
            label.style.cursor = 'pointer';
            
            // Add tooltip
            label.title = 'Başlığı dəyişmək üçün klikləyin';
            
            // Add event listener for click
            label.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Don't proceed if we're already editing
                if (label.querySelector('.edit-label-input')) return;
                
                // Create editable input
                const originalText = label.innerText || label.textContent;
                const inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.value = originalText;
                inputField.style.width = '100%';
                inputField.style.marginBottom = '5px';
                inputField.className = 'edit-label-input';
                
                // Save the current content for restoration if needed
                const savedContent = label.innerHTML;
                
                // Replace label content with input
                label.innerHTML = '';
                label.appendChild(inputField);
                
                // Focus the input
                inputField.focus();
                inputField.select();
                
                function finishEditing() {
                    if (!inputField.parentNode) return; // Already removed
                    
                    const newText = inputField.value.trim() || originalText;
                    
                    // For legends and other elements that might have child elements,
                    // we need to be careful how we restore the content
                    if (label.tagName.toLowerCase() === 'legend') {
                        label.innerHTML = newText;
                    } else {
                        label.textContent = newText;
                    }
                    
                    // Store original for reference
                    label.dataset.originalText = originalText;
                    
                    // Remove the input event listener to prevent memory leaks
                    inputField.removeEventListener('blur', finishEditing);
                    inputField.removeEventListener('keydown', handleKeydown);
                }
                
                function handleKeydown(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        finishEditing();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        // Restore original content
                        label.innerHTML = savedContent;
                        
                        // Remove event listeners
                        inputField.removeEventListener('blur', finishEditing);
                        inputField.removeEventListener('keydown', handleKeydown);
                    }
                }
                
                // Handle input blur (finish editing)
                inputField.addEventListener('blur', finishEditing);
                
                // Handle Enter key and Escape key
                inputField.addEventListener('keydown', handleKeydown);
            });
        });
    }

    function removeFormElement(element) {
        // Remove from DOM
        element.remove();
        
        // Remove from array
        const elementId = element.querySelector('input, textarea, select')?.id || '';
        formElements = formElements.filter(item => item.element !== element);
    }

    function validateForm() {
        let isValid = true;
        const requiredInputs = form.querySelectorAll('input[required], textarea[required]');
        
        // Reset previous validation messages
        document.querySelectorAll('.validation-message').forEach(el => el.remove());
        
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                const errorMsg = document.createElement('div');
                errorMsg.className = 'validation-message';
                errorMsg.textContent = 'Bu sahə tələb olunur';
                errorMsg.style.color = 'red';
                errorMsg.style.fontSize = '12px';
                errorMsg.style.marginTop = '5px';
                input.parentNode.appendChild(errorMsg);
                
                input.style.borderColor = 'red';
            } else {
                input.style.borderColor = '';
            }
        });
        
        // Validate email format
        const emailInputs = form.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            if (input.value.trim() && !validateEmail(input.value)) {
                isValid = false;
                const errorMsg = document.createElement('div');
                errorMsg.className = 'validation-message';
                errorMsg.textContent = 'Etibarlı e-poçt daxil edin';
                errorMsg.style.color = 'red';
                errorMsg.style.fontSize = '12px';
                errorMsg.style.marginTop = '5px';
                input.parentNode.appendChild(errorMsg);
                
                input.style.borderColor = 'red';
            }
        });
    
        // Validate phone format
        const phoneInputs = form.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            if (input.value.trim() && !validatePhone(input.value)) {
                isValid = false;
                const errorMsg = document.createElement('div');
                errorMsg.className = 'validation-message';
                errorMsg.textContent = 'Etibarlı telefon nömrəsi daxil edin';
                errorMsg.style.color = 'red';
                errorMsg.style.fontSize = '12px';
                errorMsg.style.marginTop = '5px';
                input.parentNode.appendChild(errorMsg);
                
                input.style.borderColor = 'red';
            }
        });
        
        return isValid;
    }

    // Function to restrict phone input to only numbers and plus sign
    function setupPhoneInputs() {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        
        phoneInputs.forEach(input => {
            // Skip if already set up
            if (input.dataset.phoneSetup) return;
            input.dataset.phoneSetup = "true";
            
            // Add input event for real-time validation
            input.addEventListener('input', function(e) {
                // Keep only numbers and + sign
                this.value = this.value.replace(/[^\d+]/g, '');
                
                // Ensure + is only at the beginning
                if (this.value.indexOf('+') > 0) {
                    this.value = this.value.replace(/\+/g, '');
                    this.value = '+' + this.value;
                }
                
                // Restrict multiple + signs
                const plusCount = (this.value.match(/\+/g) || []).length;
                if (plusCount > 1) {
                    this.value = this.value.replace(/\+/g, '');
                    this.value = '+' + this.value;
                }
            });
            
            // Add keydown event to prevent typing invalid characters
            input.addEventListener('keydown', function(e) {
                // Allow: backspace, delete, tab, escape, enter
                if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
                    // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39) ||
                    // Allow plus sign
                    e.key === '+') {
                    return;
                }
                
                // Ensure that it is a number and stop the keypress if not
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
                    (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        // Validate phone with international format (+ followed by 10-15 digits)
        const re = /^\+[0-9]{10,15}$/;
        return re.test(phone);
    }

    function submitForm() {
        // Collect form data
        const formData = new FormData(form);
        const formDataObj = {};
        
        // Process regular form elements
        for (const [key, value] of formData.entries()) {
            // Handle checkbox groups (multiple values with same name)
            if (formDataObj[key] !== undefined && form.querySelector(`input[type="checkbox"][name="${key}"]`)) {
                if (!Array.isArray(formDataObj[key])) {
                    formDataObj[key] = [formDataObj[key]];
                }
                formDataObj[key].push(value);
            } else {
                formDataObj[key] = value;
            }
        }
        
        // Handle checkboxes that aren't checked (not included in FormData)
        const checkboxGroups = {};
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            if (!checkboxGroups[checkbox.name]) {
                checkboxGroups[checkbox.name] = [];
            }
            
            if (checkbox.checked) {
                checkboxGroups[checkbox.name].push(checkbox.value);
            }
        });
        
        // Add checkbox groups to formDataObj
        for (const [name, values] of Object.entries(checkboxGroups)) {
            formDataObj[name] = values;
        }
        
        // Convert the form data object to JSON string
        const jsonData = JSON.stringify(formDataObj);
        console.log('Form data JSON:', jsonData);
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"], .submit button');
        if (submitBtn) {
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Göndərilir...';
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                // Reset form after successful submission
                form.reset();
                
                // Show success message
                showMessage('Məlumat uğurla göndərildi!', 'success');
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 1500);
        }
    }

    function showMessage(text, type) {
        // Remove existing messages first
        document.querySelectorAll('.message').forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        messageDiv.style.padding = '15px';
        messageDiv.style.margin = '15px 0';
        messageDiv.style.borderRadius = '4px';
        
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.style.border = '1px solid #c3e6cb';
        } else {
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.style.border = '1px solid #f5c6cb';
        }
        
        form.parentNode.insertBefore(messageDiv, form);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Make form elements sortable
    makeSortable();

    function makeSortable() {
        if (!form) return;
        
        // Add sorting handles to existing elements
        document.querySelectorAll('.form-group:not(.submit)').forEach(group => {
            if (!group.querySelector('.sort-handle')) {
                addSortHandles(group);
            }
        });
        
        // Clear existing event listeners to avoid duplicates
        form.removeEventListener('dragstart', handleFormDragStart);
        form.removeEventListener('dragover', handleFormDragOver);
        form.removeEventListener('dragend', handleFormDragEnd);
        
        // Setup sorting functionality
        form.addEventListener('dragstart', handleFormDragStart);
        form.addEventListener('dragover', handleFormDragOver);
        form.addEventListener('dragend', handleFormDragEnd);
    }
    
    function handleFormDragStart(e) {
        if (e.target.classList.contains('form-group')) {
            e.dataTransfer.setData('text/plain', 'move-element');
            e.target.classList.add('dragging');
        }
    }
    
    function handleFormDragOver(e) {
        e.preventDefault();
        
        const draggingElement = document.querySelector('.dragging');
        if (!draggingElement) return;
        
        const afterElement = getDragAfterElement(form, e.clientY);
        const submitBtn = form.querySelector('.submit');
        
        if (afterElement === null) {
            form.insertBefore(draggingElement, submitBtn);
        } else if (afterElement !== draggingElement) {
            form.insertBefore(draggingElement, afterElement);
        }
    }
    
    function handleFormDragEnd(e) {
        if (e.target.classList.contains('form-group')) {
            e.target.classList.remove('dragging');
        }
    }

    function addSortHandles(element) {
        // Skip if already has a sort handle
        if (element.querySelector('.sort-handle')) return;
        
        // Make element draggable
        element.setAttribute('draggable', 'true');
        
        // Add sort handle
        const sortHandle = document.createElement('div');
        sortHandle.className = 'sort-handle';
        sortHandle.innerHTML = '<i class="fa fa-grip-lines"></i>';
        sortHandle.style.cursor = 'move';
        sortHandle.style.position = 'absolute';
        sortHandle.style.top = '10px';
        sortHandle.style.right = '40px';
        sortHandle.style.color = '#aaa';
        
        // Position the element relatively if not already
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(sortHandle);
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.form-group:not(.dragging):not(.submit)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Add CSS for handling new elements
    addDynamicStyles();

    function addDynamicStyles() {
        // Check if styles already added
        if (document.getElementById('dynamic-form-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'dynamic-form-styles';
        styleElement.textContent = `
            .form-group {
                position: relative;
                margin-bottom: 15px;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background-color: #fff;
            }
            
            .remove-element {
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                color: #ff4d4d;
                cursor: pointer;
                z-index: 10;
            }
            
            .dragging {
                opacity: 0.5;
                border: 2px dashed #4CAF50;
            }
            
            .dragover {
                border: 2px dashed #4CAF50;
                padding: 20px;
                border-radius: 8px;
            }
            
            .validation-message {
                color: red;
                font-size: 12px;
                margin-top: 5px;
            }
            
            fieldset {
                border: none;
                padding: 0;
                margin: 0;
            }
            
            legend {
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .form select {
                width: 100%;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background-color: white;
            }
            
            .editable-label {
                position: relative;
                font-weight: bold;
                transition: background-color 0.2s;
            }
            
            .editable-label:hover {
                background-color: #f0f0f0;
            }
            
            .editable-label:hover::after {
                content: '✏️';
                font-size: 12px;
                margin-left: 5px;
            }
            
            .edit-label-input {
                font-weight: bold;
                padding: 2px 5px;
                border: 1px solid #ddd;
                border-radius: 3px;
                font-size: inherit;
            }
            
            .menu-item {
                cursor: pointer;
                transition: background-color 0.2s;
                padding: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .menu-item:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
        `;
        
        document.head.appendChild(styleElement);
    }

    // Make existing labels editable
    makeAllLabelsEditable();
    
    function makeAllLabelsEditable() {
        document.querySelectorAll('.form-group:not(.submit)').forEach(element => {
            makeLabelsEditable(element);
        });
    }
});
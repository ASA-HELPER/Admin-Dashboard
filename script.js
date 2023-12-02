 // Global variable to store fetched data
let membersData = [];
let currentPage = 1;
const itemsPerPage = 10;

// Function to fetch data from the API and store in localStorage if it's empty
function fetchDataAndStore() {
  const localStorageData = localStorage.getItem('membersData');
  if (localStorageData!=null && localStorageData?.length==0) {
    fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('membersData', JSON.stringify(data));
        membersData = data
        displayMembers(currentPage);
        renderPagination();
      })
      .catch(error => console.error('Error fetching data:', error));
  }
  else {
    // If data is already in localStorage, then parse the data from the localstorage.
    membersData = JSON.parse(localStorageData);
    displayMembers(currentPage);
    renderPagination();
  }
}

// Call the function to fetch data and store if localStorage is empty
window.addEventListener("load",()=>{
  fetchDataAndStore();
})

// Function to display members on a specific page
function displayMembers(page, data = membersData) {
  const memberList = document.getElementById('memberList');
  memberList.innerHTML = '';
  // Calculate start and end index for current page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // getting the sliced data for current page
  const membersToDisplay = data?.slice(startIndex, endIndex);
  membersToDisplay?.forEach(member => {
    const memberDiv = document.createElement('div');
    memberDiv.classList.add('member');
    memberDiv.innerHTML = `
      <input type="checkbox" class="member-checkbox" value="${member.id}">
      <span>${member.name}</span>
      <span>${member.email}</span>
      <span>${member.role}</span>
      <span>
      <button class="edit" onclick="editMember(${member.id}, '${member.name}','${member.email}','${member.role}')">Edit</button>
      <button class="delete" onclick="deleteMember(${member.id})">Delete</button>
      </span>
    `;
    memberList.appendChild(memberDiv);
  });
}

// Array to store checkbox states
let checkboxStates = [];
let selectAllChecked = false;

// Function to initialize checkboxStates array based on membersData length
function initializeCheckboxStates() {
  checkboxStates = Array(membersData?.length).fill(false);
}

// Function to handle "Select/Deselect All" checkbox for the current page
document.getElementById('selectAll').addEventListener('change', function() {
  const checkboxes = document.querySelectorAll('.member-checkbox');
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  checkboxes?.forEach((checkbox, index) => {
    const isVisible = (index+startIndex) >= startIndex && (index+startIndex) < endIndex;
    if (isVisible) {
      checkbox.checked = this.checked;
      checkboxStates[index+startIndex] = this.checked;
    }
    if(checkbox.checked)
    {
      const row = checkbox.closest('div');
      row.classList.add('selected');
    }
    else
    {
      const row = checkbox.closest('div');
      row.classList.remove('selected');
    }
  });
  selectAllChecked = this.checked;
});


// Function to handle individual checkboxes for the current page
let memberCheckboxes = document.querySelectorAll('.member-checkbox');
memberCheckboxes?.forEach((checkbox, index) => {
  checkbox.checked = checkboxStates[index];
  checkbox.addEventListener('change', function() {
    let checkboxes = document.querySelectorAll('.member-checkbox');
    const allChecked = [...checkboxes].every(checkbox => checkbox.checked);
    selectAllChecked = allChecked;
  });
});

document.getElementById('memberList').addEventListener('change', function(event) {
  if (event.target.matches('.member-checkbox')) {
    const checkbox = event.target;
    const row = checkbox.closest('div');
    if (checkbox.checked) {
      row.classList.add('selected');
    } else {
      row.classList.remove('selected');
    }
  }
});

function saveMember(index)
{
  const memberDiv = document.querySelector(`.member:nth-child(${index + 1})`);
  const member = membersData[index];
  member.name = document.getElementById('editName').value;
  member.email = document.getElementById('editEmail').value;
  member.role = document.getElementById('editRole').value;
  memberDiv.innerHTML = `
      <input type="checkbox" class="member-checkbox" value="${member.id}">
      <span>${member.name}</span>
      <span>${member.email}</span>
      <span>${member.role}</span>
      <span>
      <button class="edit" onclick="editMember(${member.id}, '${member.name}','${member.email}','${member.role}')">Edit</button>
      <button class="delete" onclick="deleteMember(${member.id})">Delete</button>
      </span>
    `;
    localStorage.setItem('membersData', JSON.stringify(membersData));
    alert('Record is successfully updated!!!')
  return;
}  

// Function to handle member editing
function editMember(memberId,updatedName,updatedEmail,updatedRole) {
  let index = -1;
  membersData?.forEach((element,ind) => {
    if(element.id == memberId)
    {
      index = ind;
    }
  });
  if (index !== -1) {
    const memberDiv = document.querySelector(`.member:nth-child(${index + 1})`);
    const member = membersData[index];
    member.name = updatedName;
    member.email = updatedEmail;
    member.role = updatedRole;
    // Create input fields to edit member details
    memberDiv.innerHTML = `
      <input type="text" id="editName" value="${member.name}">
      <input type="text" id="editEmail" value="${member.email}">
      <input type="text" id="editRole" value="${member.role}">
      <button class="save" onclick="saveMember(${index})">Save</button>
    `;
  }
  return;
} 

// Function to handle member deletion
function deleteMember(memberId) {
  let index = -1;
  for(var i=0;i<membersData?.length;i++)
  {
    if(membersData[i].id==memberId)
    {
      index = i;
      break;
    }
  }
  if (index !== -1) {
    // Remove the member from the array
    membersData.splice(index, 1);
    localStorage.setItem('membersData', JSON.stringify(membersData));
    displayMembers(currentPage, membersData);
    renderPagination();
    alert("Record is successfully deleted!!!")
  }
}

let selectedIds = [];
// Function to delete the selected items
function deleteSelected(){
  const checkboxes = document.querySelectorAll('.member-checkbox');
  checkboxes?.forEach(checkbox => {
    if (checkbox.checked) {
      const memberId = checkbox.value;
      selectedIds.push(memberId);
    }
  });

  membersData = membersData.filter(member => !selectedIds.includes(member.id));
  selectAllChecked = false;
  if(selectedIds?.length==0)
  {
    alert("You have selected no items to delete.")
    return;
  }
  selectedIds = []
  alert("Selected items are deleted successfully!!!")
  localStorage.setItem('membersData', JSON.stringify(membersData));
  displayMembers(currentPage, membersData);
  renderPagination();
}

const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    const searchTerm = event.target.value.trim();
    membersData = JSON.parse(localStorage.getItem('membersData'));
    const filteredMembers = membersData.filter(member =>
      member.role.includes(searchTerm) ||
      member.name.includes(searchTerm) ||
      member.email.includes(searchTerm)
    );
    membersData = filteredMembers;
    displayMembers(1, membersData);
    renderPagination(membersData?.length);
  }
});

searchInput.addEventListener('change',function(event){
  if (event.target.value.trim() == '') {
    const searchTerm = event.target.value.trim();
    membersData = JSON.parse(localStorage.getItem('membersData'));
    const filteredMembers = membersData.filter(member =>
      member.role.includes(searchTerm) ||
      member.name.includes(searchTerm) ||
      member.email.includes(searchTerm)
    );
    membersData = filteredMembers;
    displayMembers(1, membersData);
    renderPagination(membersData?.length);
  }
})

// Function to render pagination
function renderPagination(totalItems = membersData?.length) {
  const paginationDiv = document.querySelector('.pagination');
  paginationDiv.innerHTML = '';
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  selectAllChecked = false;
  document.getElementById('selectAll').checked = false;
  // Create buttons for first, previous, next, and last pages
  const firstButton = createPaginationButton('First', 1);
  const prevButton = createPaginationButton('Previous', currentPage - 1);
  const nextButton = createPaginationButton('Next', currentPage + 1);
  const lastButton = createPaginationButton('Last', totalPages);
  paginationDiv.appendChild(firstButton);
  paginationDiv.appendChild(prevButton);
  // Generate numbered page buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = createPaginationButton(i, i);
    paginationDiv.appendChild(pageButton);
  }
  paginationDiv.appendChild(nextButton);
  paginationDiv.appendChild(lastButton);
}

// Function to create pagination buttons
function createPaginationButton(text, targetPage) {
  const button = document.createElement('button');
  button.textContent = text;
  if (text === currentPage.toString()) {
    button.classList.add('active');
  }
  if (text === 'First' || text === 'Previous' || text === 'Next' || text === 'Last') {
    button.classList.add(text.toLowerCase()+'-page');
    button.onclick = () => {
      if (targetPage >= 1 && targetPage <= Math.ceil(membersData?.length / itemsPerPage)) {
        currentPage = targetPage;
        displayMembers(currentPage);
        renderPagination();
      }
    };
  }
  else {
    button.onclick = () => {
      currentPage = targetPage;
      displayMembers(currentPage);
      renderPagination();
    };
  }
  return button;
}
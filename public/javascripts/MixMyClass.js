// model data for testing the logic, just left the needed fields
let users = [
  {
    workedWith: [],
    username: "Andre".toLowerCase(),
    role: "Student"
  },
  {
    workedWith: [],
    username: "Malte".toLowerCase(),
    role: "Student"
  },
  {
    workedWith: [],
    username: "Stefanie".toLowerCase(),
    role: "Student"
  },
  {
    workedWith: [],
    username: "Min".toLowerCase(),
    role: "Student"
  },
  {
    workedWith: [],
    username: "Franzi".toLowerCase(),
    role: "Student"
  },
  {
    workedWith: [],
    username: "Amelia".toLowerCase(),
    role: "Student"
  },
  {
    workedWith: [],
    username: "Marvin".toLowerCase(),
    role: "Student"
  },
  {
    workedWith: [],
    username: "Ksenia".toLowerCase(),
    role: "Student"
  },
  {
    workedWith: [],
    username: "Felix".toLowerCase(),
    role: "Student"
  },
  {
    workedWith: [],
    username: "Julia".toLowerCase(),
    role: "Student"
  },
  {
    workedWith: [],
    username: ("Maxence" + "Teacher").toLowerCase(),
    role: "Teacher"
  },
  {
    workedWith: [],
    username: ("Thor" + "TA").toLowerCase(),
    role: "TA"
  }
];

class MixMyClass {
  constructor(users) {
    this.users = users; // might not be necessary
    this.students = this.users.filter(user => user.role === "Student");
  }

  // standard fisher-yates shuffle, if groupPartner = repeat
  shuffle(students) {
    for (let i = students.length - 1; i > 0; i--) {
      // generate random index j
      const j = Math.floor(Math.random() * (i + 1));
      // swap last element with element at random index j
      [students[i], students[j]] = [students[j], students[i]];
    }
  }
  // shuffle, that takes the workedWith property into account
  shuffleWithSequence(students) {
    function oneIteration() {
      times++;
      for (let i = students.length - 1; i > 0; i -= 2) {
        if (i - 1 < 0) {
          return students;
        }

        let j = Math.floor(Math.random() * (i + 1));

        // if second last student already worked together with student at random index j, regenerate random index
        while (students[i - 1].workedWith.includes(students[j].username)) {
          // console.log(
          //   `${students[i - 1].username} already worked with ${
          //     students[j].username
          //   }, dice again...`
          // );
          j = Math.floor(Math.random() * (i + 1));
        }

        // swap last student with student at random index j -> this will create group of two, therfore decrease i by 2
        // hence it can happen, that the two remaining students already worked togther
        [students[i], students[j]] = [students[j], students[i]];
      }
      // to solve this issue, repeat the whole process again, try for max 99 times
      if (students[0].workedWith.includes(students[1].username) && times < 100) {
        console.log(`${times}: I'll do it again for ${students[0].username} and ${students[1].username}`);
        that.shuffle(students);
        oneIteration();
      }
    }
    let times = 0;
    let that = this;
    oneIteration();
  }

  // main method to create groups of different sizes, taking the present students into account with opt for not repeating group partners in groups of two
  createGroups(size = 2, notPresent = [], groupPartner = "noRepeat") {
    let presentStudents = this.students.filter(student => !notPresent.includes(student.username));

    let groups = [];

    // checking, that groupPartner is set to repeat, if group size is different than 2
    if (size !== 2) {
      groupPartner = "repeat";
    }

    switch (groupPartner) {
      case "repeat":
        // shuffle all present students and divide in groups of "size"
        this.shuffle(presentStudents);

        while (presentStudents.length > 0) {
          groups.push(presentStudents.splice(0, size));
        }

        return groups;

      case "noRepeat":
        // shuffle all present students respecting workedWith property
        this.shuffleWithSequence(presentStudents);
        console.log(`This is round ${round}`); // TESTING
        round++; // TESTING

        while (presentStudents.length > 0) {
          groups.push(presentStudents.splice(0, size));
        }

        // pushing usernames of buddies in students workedWith array
        groups.forEach(group => {
          group.forEach(student => {
            let currentStudent = student;
            let buddies = group.filter(student => student !== currentStudent);
            buddies.forEach(buddy => student.workedWith.push(buddy.username)); // username for TESTING, must be replaced with _id
          });
        });

        return groups;
    }
  }
}

// // TESTING
// let newClass = new MixMyClass(users);

// // TESTING PAIR PROGRAMMING FEATURE
let round = 0; // TESTING
// newClass.createGroups(2, ["ksenia", "felix", "marvin", "julia"]);
// newClass.createGroups(2, ["ksenia", "felix", "marvin", "julia"]);
// newClass.createGroups(2, ["ksenia", "felix", "marvin", "julia"]);
// newClass.createGroups(2, ["ksenia", "felix", "marvin", "julia"]);
// newClass.createGroups(2, ["ksenia", "felix", "marvin", "julia"]);
// newClass.createGroups(2, ["ksenia", "felix", "marvin", "julia"]);
// console.log(newClass.students[0].username, newClass.students[0].workedWith);
// console.log(newClass.students[1].username, newClass.students[1].workedWith);
// console.log(newClass.students[2].username, newClass.students[2].workedWith);
// console.log(newClass.students[3].username, newClass.students[3].workedWith);
// console.log(newClass.students[4].username, newClass.students[4].workedWith);
// console.log(newClass.students[5].username, newClass.students[5].workedWith);
// console.log(newClass.students[6].username, newClass.students[6].workedWith);
// console.log(newClass.students[7].username, newClass.students[7].workedWith);
// console.log(newClass.students[8].username, newClass.students[8].workedWith);
// console.log(newClass.students[9].username, newClass.students[9].workedWith);

// // TESTING GROUPS WITH DIFFERENT SIZES
// let groupsOfThree = newClass.createGroups(3, ["ksenia"]);
// console.log(groupsOfThree);
// let groupsOfFive = newClass.createGroups(5, ["ksenia"]);
// console.log(groupsOfFive);

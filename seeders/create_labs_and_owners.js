'use strict'

const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {

    console.log("Create labs")
    await queryInterface.bulkInsert('Labs', [
      {id: 1, name: 'Lab 1', createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'},
      {id: 2, name: 'Lab 2', createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'}
    ], {})

    console.log("Create users")
    const pass = bcrypt.hashSync('1234', 10)
    await queryInterface.bulkInsert('Users', [
      {id: 1, userName: 'dannym', email: 'danny@geneyx.com', password: pass, type: 3, LabId: 1, createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'},
      {id: 2, userName: 'avi',    email: 'avi@geneyx.com',   password: pass, type: 3, LabId: 2, createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'}
    ], {})

    console.log("Create owners")
    queryInterface.bulkInsert('Owners', [
      {
        id: 1,
        identity: 'user1',
        gender: 1,
        hpo_terms: 'global developmental delay,failure to thrive,hypotonia,Talipes equinovarus,Abnormal facial shape',
        ethnicity: 'אם-מרוקו, אב-כורדיסטן, מרוקו',
        createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'
      },
      {
        id: 2,
        identity: 'user2',
        gender: 2,
        hpo_terms: 'global developmental delay',
        ethnicity: '  מרוקו',
        createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'
      },
      {
        id: 3,
        identity: 'user3',
        gender: 3,
        hpo_terms: 'global developmental delay,failure to thrive',
        ethnicity: 'אב-כורדיסטן, ',
        createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'
      },
      {
        id: 4,
        identity: 'user4',
        gender: 1,
        hpo_terms: 'Healthy',
        ethnicity: 'פולין',
        createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'
      },
    ], {})

    console.log('Create lab owners')
    await queryInterface.bulkInsert('LabOwners', [
      {id: 1, LabId: 1, OwnerId: 1, createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'},
      {id: 2, LabId: 1, OwnerId: 2, createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'},
      {id: 3, LabId: 2, OwnerId: 3, createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'},
      {id: 4, LabId: 2, OwnerId: 4, createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'},
    ], {})

    console.log('Create files')
    await queryInterface.bulkInsert('Files', [
      {
       id: 1, url: 'https://s3-eu-west-1.amazonaws.com/geneyx-test-bucket/test-1.fastq',
       file_meta_data: "{}",
       OwnerId: 1, createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'
      }, {
       id: 2, url: 'https://s3-eu-west-1.amazonaws.com/geneyx-test-bucket/test-2.fastq',
       file_meta_data: "{}",
       OwnerId: 2, createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'
      }, {
       id: 3, url: 'https://s3-eu-west-1.amazonaws.com/geneyx-test-bucket/test-3.fastq',
       file_meta_data: "{}",
       OwnerId: 3, createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'
      }, {
       id: 4, url: 'https://s3-eu-west-1.amazonaws.com/geneyx-test-bucket/test-4.fastq',
       file_meta_data: "{}",
       OwnerId: 4, createdAt: '2019-04-10 12:12:12', updatedAt: '2019-04-10 12:12:12'
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    console.log("Delete labs")
    await queryInterface.bulkDelete('Labs', null, {})

    console.log("Delete owners")
    await queryInterface.bulkDelete('Owners', null, {})

    console.log("Delete labs owners")
    await queryInterface.bulkDelete('LabOwners', null, {})

    console.log("Delete labs files")
    await queryInterface.bulkDelete('Files', null, {})
    
    console.log("Delete users")
    return queryInterface.bulkDelete('Users', null, {})
  }
};
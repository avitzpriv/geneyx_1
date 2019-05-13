'use strict'

const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {

    console.log("Create labs")
    await queryInterface.bulkInsert('labs', [
      {id: 1, name: 'Lab 1', created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'},
      {id: 2, name: 'Lab 2', created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'}
    ], {})

    console.log("Create users")
    const pass = bcrypt.hashSync('1234', 10)
    await queryInterface.bulkInsert('users', [
      {id: 1, user_name: 'dannym', email: 'danny@geneyx.com', password: pass, type: 3, lab_id: 1, created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'},
      {id: 2, user_name: 'avi',    email: 'avi@geneyx.com',   password: pass, type: 3, lab_id: 2, created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'}
    ], {})

    console.log("Create owners")
    queryInterface.bulkInsert('owners', [
      {
        id: 1,
        identity: 'user1',
        gender: 1,
        hpo_terms: 'global developmental delay,failure to thrive,hypotonia,Talipes equinovarus,Abnormal facial shape',
        ethnicity: 'אם-מרוקו, אב-כורדיסטן, מרוקו',
        created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'
      },
      {
        id: 2,
        identity: 'user2',
        gender: 2,
        hpo_terms: 'global developmental delay',
        ethnicity: '  מרוקו',
        created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'
      },
      {
        id: 3,
        identity: 'user3',
        gender: 3,
        hpo_terms: 'global developmental delay,failure to thrive',
        ethnicity: 'אב-כורדיסטן, ',
        created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'
      },
      {
        id: 4,
        identity: 'user4',
        gender: 1,
        hpo_terms: 'Healthy',
        ethnicity: 'פולין',
        created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'
      },
    ], {})

    console.log('Create lab owners')
    await queryInterface.bulkInsert('lab_owners', [
      {id: 1, lab_id: 1, owner_id: 1, created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'},
      {id: 2, lab_id: 1, owner_id: 2, created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'},
      {id: 3, lab_id: 2, owner_id: 3, created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'},
      {id: 4, lab_id: 2, owner_id: 4, created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'},
    ], {})

    console.log('Create files')
    await queryInterface.bulkInsert('files', [
      {
       id: 1, url: 'https://s3-eu-west-1.amazonaws.com/geneyx-test-bucket/test-1.fastq',
       file_meta_data: "{}",
       owner_id: 1, created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'
      }, {
       id: 2, url: 'https://s3-eu-west-1.amazonaws.com/geneyx-test-bucket/test-2.fastq',
       file_meta_data: "{}",
       owner_id: 2, created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'
      }, {
       id: 3, url: 'https://s3-eu-west-1.amazonaws.com/geneyx-test-bucket/test-3.fastq',
       file_meta_data: "{}",
       owner_id: 3, created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'
      }, {
       id: 4, url: 'https://s3-eu-west-1.amazonaws.com/geneyx-test-bucket/test-4.fastq',
       file_meta_data: "{}",
       owner_id: 4, created_at: '2019-04-10 12:12:12', updated_at: '2019-04-10 12:12:12'
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    console.log("Delete labs")
    await queryInterface.bulkDelete('labs', null, {})

    console.log("Delete owners")
    await queryInterface.bulkDelete('owners', null, {})

    console.log("Delete labs owners")
    await queryInterface.bulkDelete('lab_owners', null, {})

    console.log("Delete labs files")
    return queryInterface.bulkDelete('files', null, {})
    
    // console.log("Delete users")
    // return queryInterface.bulkDelete('users', null, {})
  }
}
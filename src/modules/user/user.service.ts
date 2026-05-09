import status from "http-status";

import AppError from "../../errorHelpers/AppError";
import { IcreateAdmin} from "./userTypes";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { UserRole } from "../../generated/enums";
import { IqueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utilis/queryBuilder";

import type { User, Prisma } from "../../generated/client";


// create admin and admin profile

const createAdmin = async (payload: IcreateAdmin) => {
    //chack  if admin with same email already exists
    const existsUser = await prisma.user.findUnique({
        where:{
            email:payload.admin.email
        }
    })

    if(existsUser){
        throw new AppError(status.BAD_REQUEST, "user with same email already exists");
    }



    //create admin with betterAuth
    const userData = await auth.api.signUpEmail({
        body:{
            email:payload.admin.email,
            password:payload.password,
            name: payload.admin.name,
             role: UserRole.ADMIN,
             needPasswordChange: true
        }
    })
    console.log("User Data from auth:", userData)


    //create admin profile
    try{
   const result = await prisma.$transaction(async(tx) => {
     const adminData = await tx.admin.create({
        data:{
            userId:userData.user.id,
            ...payload.admin
        }
     })

console.log("Payload admin:", payload.admin)

console.log("Admin Data from DB:", adminData.id)
    
    const admin = await tx.admin.findUnique({
        where:{
            id: adminData.id
        },
       
        select:{
            id:true,
             name:true,
             email:true,
            contactNumber:true,
           profilePhoto:true,
           createdAt:true,
           updatedAt:true,
            user:{
                select:{
                    id:true,
                    email:true,
                    name:true,
                    role:true,
                    status:true,
                    emailVerified:true,
                }
            }
        }

    })
    console.log('admin:', admin);

   return admin


   })




   
   console.log('result:', result);
   return result
    }

    catch(error){
        console.log("transaction error", error);
        await prisma.user.delete({
            where:{
                id:userData.user.id
            }
        })
        throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create admin profile");
    }

    
   
}
    

// get all clients
const getAllClients = async (query: IqueryParams) => {
    const queryBuilder = new QueryBuilder<
        User,
        Prisma.UserWhereInput,
        Prisma.UserInclude
    >(prisma.user, query, {
        searchableFields: ["name", "email"],
        filterableFields: ["name", "email", "isDeleted", "id"],
    });

    const result = await queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
        })
        .paginate()
        .sort()
        .fields()
        .excute();

    return result;
};


// Update profile (all users)
const updateProfile = async (userId: string, payload: any) => {
    // Only allow certain fields to be updated
    const allowedFields = ["name", "email", "contactNumber", "profilePhoto"]; // add more as needed
    const updateData: any = {};
    for (const key of allowedFields) {
        if (payload[key] !== undefined) updateData[key] = payload[key];
    }
    const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
    });
    return user;
};

export const userService = {
   createAdmin,
   getAllClients,
   updateProfile,
}

/**
 * --------------------------------------------------------
 * File: app/api/supabase-mock/route.ts
 * Purpose: Secure local database routing endpoint.
 * Responsibilities: Intercepts client-side query requests, translates them to server-side Prisma operations, handles filters, sorting, updates, inserts, and counts on the local SQLite instance, and formats responses.
 * Author: Antigravity Maintainer
 * --------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { table, action, filters, orderField, orderAsc, limit, single, values, selectOptions } = await req.json();

        // 1. Map lower_snake_case tables to Prisma model controllers
        const modelMap: any = {
            areas: prisma.area,
            infrastructure_nodes: prisma.infrastructureNode,
            saved_areas: prisma.savedArea,
            community_posts: prisma.communityPost,
            community_comments: prisma.communityComment,
            community_members: prisma.communityMember,
            user_profiles: prisma.userProfile,
            property_listings: prisma.propertyListing,
            property_images: prisma.propertyImage,
            property_metadata: prisma.propertyMetadata,
            visit_scores: prisma.visitScore,
            visit_score_history: prisma.visitScoreHistory,
            datasets: prisma.dataset,
            dataset_files: prisma.datasetFile,
        };

        const model = modelMap[table];
        if (!model) {
            return NextResponse.json({ error: `Table ${table} not mapped` }, { status: 400 });
        }

        // Helper to format snake_case payload values to camelCase keys for Prisma
        const toCamelCase = (str: string) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        const toSnakeCase = (str: string) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

        const formatKeys = (obj: any, transformFn: (s: string) => string): any => {
            if (!obj) return obj;
            if (obj instanceof Date) return obj.toISOString();
            if (typeof obj !== "object") return obj;
            if (Array.isArray(obj)) return obj.map(item => formatKeys(item, transformFn));
            
            const newObj: any = {};
            for (const key of Object.keys(obj)) {
                newObj[transformFn(key)] = formatKeys(obj[key], transformFn);
            }
            return newObj;
        };

        if (action === "select") {
            const queryOptions: any = {};

            // Build where filter
            if (filters && filters.length > 0) {
                const where: any = {};
                for (const filter of filters) {
                    const camelField = toCamelCase(filter.field);
                    const val = filter.value;
                    if (filter.op === "eq") {
                        where[camelField] = val;
                    } else if (filter.op === "neq") {
                        where[camelField] = { not: val };
                    } else if (filter.op === "gte") {
                        where[camelField] = { gte: Number(val) || val };
                    } else if (filter.op === "lte") {
                        where[camelField] = { lte: Number(val) || val };
                    }
                }
                queryOptions.where = where;
            }

            // Build orderBy
            if (orderField) {
                queryOptions.orderBy = {
                    [toCamelCase(orderField)]: orderAsc ? "asc" : "desc",
                };
            }

            // Build limit
            if (limit) {
                queryOptions.take = limit;
            }

            let result = null;
            let count = null;

            // Handle count request if count is passed in selectOptions
            if (selectOptions && selectOptions.count) {
                count = await model.count({ where: queryOptions.where });
            }

            // Handle head request (head: true means return only the count, no body)
            if (!selectOptions || !selectOptions.head) {
                if (single) {
                    result = await model.findFirst(queryOptions);
                } else {
                    result = await model.findMany(queryOptions);
                }
            }

            const formattedResult = formatKeys(result, toSnakeCase);

            return NextResponse.json({ data: formattedResult, count });
        }

        if (action === "insert") {
            // Convert insert values keys to camelCase for Prisma
            const camelValues = formatKeys(values, toCamelCase);
            const result = await model.create({
                data: camelValues,
            });
            const formattedResult = formatKeys(result, toSnakeCase);
            return NextResponse.json({ data: formattedResult });
        }

        if (action === "update") {
            // Build where filter
            const where: any = {};
            if (filters && filters.length > 0) {
                for (const filter of filters) {
                    where[toCamelCase(filter.field)] = filter.value;
                }
            }

            const camelValues = formatKeys(values, toCamelCase);
            
            let result;
            if (where.id) {
                result = await model.update({
                    where: { id: where.id },
                    data: camelValues,
                });
            } else {
                result = await model.updateMany({
                    where,
                    data: camelValues,
                });
            }

            const formattedResult = formatKeys(result, toSnakeCase);
            return NextResponse.json({ data: formattedResult });
        }

        if (action === "delete") {
            // Build where filter
            const where: any = {};
            if (filters && filters.length > 0) {
                for (const filter of filters) {
                    where[toCamelCase(filter.field)] = filter.value;
                }
            }

            let result;
            if (where.id) {
                result = await model.delete({
                    where: { id: where.id },
                });
            } else {
                result = await model.deleteMany({
                    where,
                });
            }

            const formattedResult = formatKeys(result, toSnakeCase);
            return NextResponse.json({ data: formattedResult });
        }

        return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

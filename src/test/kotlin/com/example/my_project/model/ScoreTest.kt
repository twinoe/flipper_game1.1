package com.example.my_project.model

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldNotBe
import jakarta.validation.Validation
import jakarta.validation.Validator

class ScoreTest : StringSpec({
    val validator: Validator = Validation.buildDefaultValidatorFactory().validator

    "create an score"{
        val score = Score(id = 1L, score = 5)

        score shouldNotBe null
    }

    "create a new valid score"{
        val score = Score(id = 1L, score = 5)

        val violations = validator.validate(score)

        violations shouldHaveSize 0
    }
})
import React, { FC, useEffect, useState } from 'react';

import { Formik, Form, Field, ErrorMessage } from 'formik';

// import { useApiReq } from '../../useHooks/useApiReqWithContext';
import { useApiReq } from '../../useHooks/useApiReqWithUseState';

import { useNotifications } from '../../useHooks/useNotifications';
import { WARNING, ERROR } from '../../constants/systemNotificationTypes';
import { messageTypeClassNames } from '../notifications/Notifications';

import { createDebugger } from '../../helpers/createDebugger';

const debug = createDebugger(__filename);

const FormTest: FC = ({ apiName, apiCall, onDone }) => {
  const { addSystemMessage } = useNotifications();

  const apiReq = useApiReq({ apiName, apiCall });

  const validateForm = (values) => {
    debug('validateForm', { values });
    return {};
  };

  debug('render', { apiReq, apiCall, apiName });

  return (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          fullName: 'Jane Doh',
          password: 'jane',
        }}
        onSubmit={async (values, actions) => {
          const { setErrors } = actions;
          const errors = {};

          const res = await apiReq.call(values);

          if (res.meta.success) {
            addSystemMessage(`Ok ${apiName}`);
          } else {
            const errorType = res.type.split('/').pop();
            switch (errorType) {
              case 'fields-invalid':
              case 'fields-conflict':
                res.errors.forEach(({ name, reason }) => {
                  errors[name] = reason;
                });
                errors.form = {
                  class: WARNING,
                  title: 'Noen felter er ikke rigtig fylt inn',
                  details: 'Gjør endringer og send inn igjen',
                };
                break;
              default:
                errors.form = {
                  class: res.meta.isRuntimeException ? ERROR : WARNING,
                  title: 'Kunne ikke oppdatere profilen din',
                  details: 'Noe gikk galt. Prøv igjen senere',
                };
            }
          }
          setErrors(errors);
          onDone(res, values);
        }}
        validate={validateForm}
      >
        {({ isSubmitting, errors }) => {
          debug('formikRender', { isSubmitting, errors });
          return (
            <Form>
              <div className="bl-grid bl-grid--small-row-gap bl-border--green bl-bg-green-3 bl-p-a-3">
                <label
                  htmlFor="fullName"
                  className="bl-grid__one-third bl-p-a-1"
                >
                  Full Name
                </label>

                <div className="bl-grid__two-thirds bl-p-a-1">
                  <Field
                    name="fullName"
                    placeholder="Jane"
                    type="input"
                    className="bl-border--green"
                    style={{ width: '100%' }}
                  />
                  {errors.fullName && (
                    <div
                      className={`${messageTypeClassNames[WARNING]} bl-p-a-1 bl-m-t-1`}
                    >
                      <ErrorMessage name="fullName" style={{ width: '100%' }} />
                    </div>
                  )}
                </div>

                <label
                  htmlFor="password"
                  className="bl-grid__one-third bl-p-a-1"
                >
                  Password
                </label>

                <div className="bl-grid__two-thirds bl-p-a-1">
                  <Field
                    name="password"
                    placeholder="Password"
                    type="password"
                    className="bl-border--green"
                    style={{ width: '100%' }}
                  />
                  {errors.password && (
                    <div
                      className={`${messageTypeClassNames[WARNING]} bl-p-a-1 bl-m-t-1`}
                    >
                      <ErrorMessage name="password" style={{ width: '100%' }} />
                    </div>
                  )}
                </div>

                {errors.form && (
                  <span
                    className={`${
                      messageTypeClassNames[errors.form.class]
                    } bl-p-a-1 bl-text-center`}
                  >
                    {errors.form.title} - {errors.form.details}
                  </span>
                )}

                <div className=" bl-grid__full bl-text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting || !apiReq}
                    className="bl-button bl-button--primary"
                  >
                    Submit to {apiReq.apiName}
                  </button>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
      {
        <div className="bl-border--sand bl-bg-sand-3 bl-p-a-3">
          <pre>{JSON.stringify(apiReq, null, 2)}</pre>
        </div>
      }
    </>
  );
};

export { FormTest };

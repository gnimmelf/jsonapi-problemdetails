import React, { FC, useEffect, useState } from 'react';

import { Formik, Form, Field, ErrorMessage } from 'formik';

import { BlSelect } from 'buflib';

import { useApi } from '../../useHooks/useApi';
import { useNotifications } from '../../useHooks/useNotifications';
import { WARNING, ERROR } from '../../constants/systemNotificationTypes';

import { messageTypeClassNames } from '../notifications/Notifications';

import { createDebugger } from '../../helpers/createDebugger';

const debug = createDebugger(__filename);

const TestForm: FC = ({ onDone }) => {
  const apis = useApi();

  const [selectedApiKey, setSelectedApiKey] = useState();

  const validateForm = (values) => {
    debug('validateForm', { values });
    return {};
  };

  const apisCount = Object.keys(apis).length;

  useEffect(() => {
    setSelectedApiKey(Object.keys(apis)[0]);
  }, [apisCount]);

  debug('render', { apis, selectedApiKey }, apisCount);

  return (
    <Formik
      enableReinitialize
      initialValues={{
        fullName: 'Jane Doh',
        password: 'jane',
      }}
      onSubmit={async (values, actions) => {
        const { setErrors } = actions;
        const errors = {};

        debug(`onSubmit:${selectedApiKey}#1`, {
          values,
          actions,
          api: apis[selectedApiKey],
          call: apis[selectedApiKey].call,
        });
        const res = await apis[selectedApiKey].call(values);
        debug(`onSubmit:${selectedApiKey}#2`, { res });

        if (!res.meta.success) {
          const errorType = res.type.split('/').pop();
          debug(`onSubmit:${selectedApiKey}#3`, { errorType });
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
        debug(`onSubmit:${selectedApiKey}#4`, { errors });
      }}
      validate={validateForm}
    >
      {({ isSubmitting, errors }) => {
        debug('formikRender', { isSubmitting, errors });
        return (
          <Form>
            <div className="bl-grid bl-grid--small-row-gap bl-border--green bl-bg-green-3 bl-p-a-3">
              <label htmlFor="fullName" className="bl-grid__one-third bl-p-a-1">
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

              <label htmlFor="password" className="bl-grid__one-third bl-p-a-1">
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
                  disabled={isSubmitting || !apis[selectedApiKey]}
                  className="bl-button bl-button--primary"
                >
                  Submit to {selectedApiKey}
                </button>
              </div>

              <div className=" bl-grid__full bl-text-center">
                <BlSelect
                  value={selectedApiKey}
                  className="bl-p-a-1"
                  onChange={({ target }) => {
                    setSelectedApiKey(target.value);
                  }}
                >
                  {Object.keys(apis).map((apiKey) => (
                    <option key={apiKey} value={apiKey}>
                      {apiKey}
                    </option>
                  ))}
                </BlSelect>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

const FormTest: FC = () => {
  const { addSystemMessage } = useNotifications();

  const onDone = (res, requestData) => {
    debug('onDone', { res, requestData });
    if (res.meta.success) {
      addSystemMessage(`success: ${res.meta.url}`);
    }
  };

  return <TestForm onDone={onDone} />;
};

export { FormTest };
